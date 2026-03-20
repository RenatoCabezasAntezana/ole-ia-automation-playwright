import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { ENV } from '../../support/env';
import { LoginPage } from '../../page/LoginPage';

Given('que el cliente se encuentra en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa un nombre de usuario válido y su contraseña correcta', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(ENV.CREDENTIALS.standard.user, ENV.CREDENTIALS.standard.password);
});

When('ingresa un nombre de usuario registrado pero una contraseña equivocada', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(ENV.CREDENTIALS.standard.user, 'wrong_password');
});

When('intenta ingresar con un usuario que ha sido bloqueado por el administrador', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.login(ENV.CREDENTIALS.locked.user, ENV.CREDENTIALS.locked.password);
});

Then(
  'el sistema le permite el ingreso y lo redirige a la url {string}',
  async function (this: CustomWorld, expectedPath: string) {
    await this.page.waitForLoadState('networkidle');
    const loginPage = new LoginPage(this.page);
    const currentPath = await loginPage.getCurrentPath();
    expect(currentPath).toBe(expectedPath);
  }
);

Then('se muestra el título {string}', async function (this: CustomWorld, expectedTitle: string) {
  const loginPage = new LoginPage(this.page);
  const title = await loginPage.getProductsTitle();
  expect(title).toBe(expectedTitle);
});

Then(
  'muestra el mensaje {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    const loginPage = new LoginPage(this.page);
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain(expectedMessage);
  }
);

Then('el cliente permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentPath = await loginPage.getCurrentPath();
  expect(currentPath).toBe('/');
});
