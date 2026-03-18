const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');

const JIRA_URL = process.env.JIRA_URL?.replace(/\/$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'SB';
const REPORT_PATH = 'reports/cucumber-report.json';
const SURGE_URL = 'https://ole-ia-automation-playwright.surge.sh';

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.log('⚠️  Jira credentials not set, skipping bug reporting.');
  process.exit(0);
}

if (!fs.existsSync(REPORT_PATH)) {
  console.log('⚠️  Report not found, skipping bug reporting.');
  process.exit(0);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

function jiraRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${JIRA_URL}${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function attachScreenshot(issueKey, screenshotBuffer, filename) {
  return new Promise((resolve, reject) => {
    const boundary = `----FormBoundary${Date.now()}`;
    const url = new URL(`${JIRA_URL}/rest/api/3/issue/${issueKey}/attachments`);

    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([header, screenshotBuffer, footer]);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'X-Atlassian-Token': 'no-check',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function bugExists(scenario) {
  const jql = encodeURIComponent(`project = ${JIRA_PROJECT_KEY} AND issuetype = Bug AND summary ~ "[AUTO]" AND summary ~ "${scenario.slice(0, 50)}" ORDER BY created DESC`);
  const res = await jiraRequest('GET', `/rest/api/3/search?jql=${jql}&maxResults=1`);
  return res.body.total > 0 ? res.body.issues[0].key : null;
}

async function createBug(scenario, error, screenshotBuffer) {
  const summary = `[AUTO] Fallo en test: ${scenario}`;
  const existing = await bugExists(scenario.slice(0, 50));
  if (existing) {
    console.log(`⚠️  Bug ya existe: ${existing} — ${summary}`);
    return existing;
  }

  const res = await jiraRequest('POST', '/rest/api/3/issue', {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      issuetype: { name: 'Bug' },
      priority: { name: 'High' },
      summary,
      description: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{
            type: 'text',
            text: [
              `Escenario fallido: ${scenario}`,
              `Error: ${error}`,
              `Reporte: ${SURGE_URL}`,
              `Ambiente: Dev`,
            ].join('\n')
          }]
        }]
      }
    }
  });

  if (res.status !== 201) {
    console.log(`❌ Error creando bug: ${JSON.stringify(res.body)}`);
    return null;
  }

  const bugKey = res.body.key;
  console.log(`✅ Bug creado: ${bugKey} — ${summary}`);

  if (screenshotBuffer) {
    const filename = `evidence-${scenario.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    const status = await attachScreenshot(bugKey, screenshotBuffer, filename);
    if (status === 200) {
      console.log(`📎 Evidencia adjuntada a ${bugKey}`);
    } else {
      console.log(`⚠️  No se pudo adjuntar evidencia (status ${status})`);
    }
  }

  return bugKey;
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const failures = [];

  for (const feature of report) {
    for (const element of feature.elements || []) {
      const failedStep = element.steps?.find(s => s.result?.status === 'failed');
      if (!failedStep) continue;

      const scenarioSlug = element.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const screenshotPath = `reports/evidence/evidence-${scenarioSlug}.png`;
      const screenshotBuffer = fs.existsSync(screenshotPath) ? fs.readFileSync(screenshotPath) : null;

      failures.push({
        scenario: element.name,
        error: failedStep.result?.error_message?.split('\n')[0] || 'Unknown error',
        screenshotBuffer,
      });
    }
  }

  if (failures.length === 0) {
    console.log('✅ No failures found — no bugs to report.');
    return;
  }

  console.log(`\n🐛 Found ${failures.length} failed scenario(s). Reporting to Jira...\n`);
  for (const { scenario, error, screenshotBuffer } of failures) {
    await createBug(scenario, error, screenshotBuffer);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
