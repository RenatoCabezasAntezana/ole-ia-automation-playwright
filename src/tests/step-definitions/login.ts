import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

Given('que el cliente se encuentra en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa el nombre de usuario {string} y la contraseña {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('ingresa el nombre de usuario {string} y una contraseña incorrecta', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword('wrong_password_123');
});

When('intenta ingresar con el usuario {string} y su contraseña correcta', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(ENV.CREDENTIALS.locked.password);
});

When('hace clic en el botón de ingresar', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

Then('el sistema permite el acceso y muestra la pantalla principal de productos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isError = await loginPage.isErrorMessageVisible();
  expect(isError).toBe(false);
});

Then('la URL de la página es {string}', async function (this: CustomWorld, expectedPath: string) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).toContain(expectedPath);
});

Then('el sistema no permite el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isError = await loginPage.isErrorMessageVisible();
  expect(isError).toBe(true);
});

Then('permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).toContain(`${ENV.BASE_URL}/`);
  expect(currentUrl).not.toContain('inventory');
});

Then('se muestra un mensaje indicando que los datos no coinciden', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.getErrorMessage();
  expect(errorText.length).toBeGreaterThan(0);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isError = await loginPage.isErrorMessageVisible();
  expect(isError).toBe(true);
});

Then('se muestra un mensaje informando que el usuario ha sido bloqueado', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.getErrorMessage();
  expect(errorText.length).toBeGreaterThan(0);
});
