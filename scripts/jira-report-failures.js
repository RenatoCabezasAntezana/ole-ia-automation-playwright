const fs = require('fs');
const https = require('https');

const JIRA_URL = process.env.JIRA_URL?.replace(/\/$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'SB';
const JIRA_TICKET_KEY = process.env.JIRA_TICKET_KEY || null;
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

  if (JIRA_TICKET_KEY) {
    const linkRes = await jiraRequest('POST', '/rest/api/3/issueLink', {
      type: { name: 'Blocks' },
      inwardIssue: { key: bugKey },
      outwardIssue: { key: JIRA_TICKET_KEY },
    });
    if (linkRes.status === 201) {
      console.log(`🔗 ${bugKey} vinculado como "blocks" a ${JIRA_TICKET_KEY}`);
    } else {
      console.log(`⚠️  No se pudo vincular ${bugKey} a ${JIRA_TICKET_KEY} (status ${linkRes.status})`);
    }
  }

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

async function commentOnTicket(ticketKey, passed, failed, bugKeys) {
  const status = failed.length === 0 ? '✅ Todos los tests pasaron' : `❌ ${failed.length} escenario(s) fallaron`;
  const passedLines = passed.map(s => `- ✅ ${s}`).join('\n');
  const failedLines = failed.map(s => `- ❌ ${s}`).join('\n');
  const bugsLine = bugKeys.length > 0
    ? `\n🐛 Bugs creados: ${bugKeys.join(', ')}`
    : '';

  const text = [
    `${status} en la ejecución de GitHub Actions.`,
    '',
    passed.length > 0 ? `*Escenarios pasados:*\n${passedLines}` : '',
    failed.length > 0 ? `*Escenarios fallidos:*\n${failedLines}` : '',
    bugsLine,
    '',
    `📊 Reporte: ${SURGE_URL}`,
  ].filter(l => l !== undefined).join('\n');

  const res = await jiraRequest('POST', `/rest/api/3/issue/${ticketKey}/comment`, {
    body: {
      type: 'doc',
      version: 1,
      content: [{
        type: 'paragraph',
        content: [{ type: 'text', text }]
      }]
    }
  });

  if (res.status === 201) {
    console.log(`💬 Comentario agregado en ${ticketKey}`);
  } else {
    console.log(`⚠️  No se pudo comentar en ${ticketKey} (status ${res.status})`);
  }
}

async function main() {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const failures = [];
  const passed = [];

  for (const feature of report) {
    for (const element of feature.elements || []) {
      const failedStep = element.steps?.find(s => s.result?.status === 'failed');
      if (failedStep) {
        const scenarioSlug = element.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const screenshotPath = `reports/evidence/evidence-${scenarioSlug}.png`;
        const screenshotBuffer = fs.existsSync(screenshotPath) ? fs.readFileSync(screenshotPath) : null;

        failures.push({
          scenario: element.name,
          error: failedStep.result?.error_message?.split('\n')[0] || 'Unknown error',
          screenshotBuffer,
        });
      } else {
        passed.push(element.name);
      }
    }
  }

  const bugKeys = [];

  if (failures.length === 0) {
    console.log('✅ No failures found — no bugs to report.');
  } else {
    console.log(`\n🐛 Found ${failures.length} failed scenario(s). Reporting to Jira...\n`);
    for (const { scenario, error, screenshotBuffer } of failures) {
      const key = await createBug(scenario, error, screenshotBuffer);
      if (key) bugKeys.push(key);
    }
  }

  if (JIRA_TICKET_KEY) {
    await commentOnTicket(
      JIRA_TICKET_KEY,
      passed,
      failures.map(f => f.scenario),
      bugKeys
    );
  } else {
    console.log('ℹ️  JIRA_TICKET_KEY not set — skipping ticket comment.');
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
