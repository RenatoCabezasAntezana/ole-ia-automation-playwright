import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

const CREDENTIALS: Record<string, { user: string; password: string }> = {
  usuario_valido:   ENV.CREDENTIALS.localAdmin,
  usuario_bloqueado: ENV.CREDENTIALS.localLocked,
  usuario_invalido:  ENV.CREDENTIALS.localInvalid,
};

Given('que el usuario esta en la pagina de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
});

When('ingresa el usuario {string} y hace clic en Login', async function (this: CustomWorld, perfil: string) {
  const creds = CREDENTIALS[perfil];
  if (!creds) throw new Error(`Perfil desconocido: "${perfil}"`);
  const loginPage = new LoginPage(this.page);
  await loginPage.login(creds.user, creds.password);
});

When('hace clic en Login sin ingresar datos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLogin();
});

Then('ve el mensaje {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.getAlertMessage();
  expect(mensajeActual.trim()).toContain(mensajeEsperado);
});

Then('es redirigido automaticamente en 1.2 segundos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.waitForRedirect(1500);
});

Then('permanece en la pagina de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const enLogin = await loginPage.isOnLoginPage();
  expect(enLogin).toBe(true);
});
