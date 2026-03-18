import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Dialog } from 'playwright';
import { CustomWorld } from './world';
import { ENV } from './env';
import * as fs from 'fs';

setDefaultTimeout(ENV.TIMEOUT);

let browser: Browser;

BeforeAll(async () => {
  const evidenceDir = 'reports/evidence';
  if (fs.existsSync(evidenceDir)) {
    fs.readdirSync(evidenceDir).forEach(file => fs.rmSync(`${evidenceDir}/${file}`));
  } else {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  browser = await chromium.launch({
    headless: ENV.HEADLESS,
    args: [
      '--disable-notifications',       // bloquea popups de notificaciones
      '--disable-infobars',            // oculta barra "Chrome está siendo controlado"
      '--disable-extensions',          // evita extensiones que interrumpan
    ],
  });
});

AfterAll(async () => {
  await browser.close();
});

Before(async function (this: CustomWorld) {
  this.browser = browser;

  this.context = await browser.newContext({
    ignoreHTTPSErrors: true,           // ignora certificados SSL inválidos
    permissions: [],                   // deniega todos los permisos (notificaciones, geolocalización, etc.)
    acceptDownloads: true,             // acepta descargas sin bloquear el test
    locale: 'es-PE',
    timezoneId: 'America/Lima',
  });

  this.page = await this.context.newPage();

  // Auto-aceptar alerts, confirms y prompts
  this.page.on('dialog', async (dialog: Dialog) => {
    await dialog.accept();
  });
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');

    if (process.env.CI) {
      const scenarioSlug = scenario.pickle.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      fs.writeFileSync(`reports/evidence/evidence-${scenarioSlug}.png`, screenshot);
    }
  }
  await this.context.close();
});
