import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

function resolveCredentials(username: string, password: string): { user: string; pass: string } {
  if (username === 'locked_out_user') {
    return {
      user: ENV.CREDENTIALS.locked.user || username,
      pass: ENV.CREDENTIALS.locked.password || password,
    };
  }
  if (username === 'standard_user') {
    return {
      user: ENV.CREDENTIALS.standard.user || username,
      pass: ENV.CREDENTIALS.standard.password || password,
    };
  }
  return { user: username, pass: password };
}

Given('que el cliente se encuentra en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa el usuario {string} y la contrasena {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  const { user, pass } = resolveCredentials(username, password);
  await loginPage.fillUsername(user);
  await loginPage.fillPassword(pass);
});

When('ingresa el usuario {string} y una contrasena incorrecta {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  const { user } = resolveCredentials(username, password);
  await loginPage.fillUsername(user);
  await loginPage.fillPassword(password);
});

When('hace clic en el boton de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

Then('el sistema debe permitir el ingreso', async function (this: CustomWorld) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/inventory');
});

Then('el cliente debe ver la pagina de productos en la url {string}', async function (this: CustomWorld, expectedPath: string) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain(expectedPath);
});

Then('el sistema no debe permitir el ingreso', async function (this: CustomWorld) {
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/inventory');
});

Then('el cliente debe ver el mensaje de error {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.getErrorMessage();
  expect(errorText).toContain(expectedMessage);
});

Then('la pagina debe permanecer en la url de login', async function (this: CustomWorld) {
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('saucedemo.com');
  expect(currentUrl).not.toContain('/inventory');
});

Then('el sistema debe denegar el acceso', async function (this: CustomWorld) {
  const currentUrl = this.page.url();
  expect(currentUrl).not.toContain('/inventory');
});
