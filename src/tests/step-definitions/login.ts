import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

const CREDENTIALS: Record<string, { user: string; password: string }> = {
  admin_local:          ENV.CREDENTIALS.localAdmin,
  bloqueado_local:      ENV.CREDENTIALS.localLocked,
  usuario_invalido_local: ENV.CREDENTIALS.localInvalid,
};

Given('que el usuario se encuentra en la página de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLogin();
});

When('ingresa el usuario {string} y hace clic en Iniciar sesión', async function (this: CustomWorld, perfil: string) {
  const loginPage = new LoginPage(this.page);
  const creds = CREDENTIALS[perfil];
  if (!creds) throw new Error(`Perfil desconocido: "${perfil}"`);
  await loginPage.login(creds.user, creds.password);
});

When('hace clic en Iniciar sesión sin completar ningún campo', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLogin();
});

Then('ve el mensaje {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.getAlertMessage();
  expect(mensajeActual.trim()).toBe(mensajeEsperado);
});

Then('es redirigido al dashboard en menos de 2 segundos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.waitForRedirect(2000);
  const url = await loginPage.getCurrentUrl();
  expect(url).not.toMatch(/localhost:3000\/?$/);
});

Then('permanece en la página de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const url = await loginPage.getCurrentUrl();
  expect(url).toMatch(/localhost:3000\/?$/);
});
