import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el cliente se encuentra en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa el usuario {string} y la contraseña {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('ingresa el usuario {string} y una contraseña incorrecta {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('intenta ingresar con el usuario {string} y la contraseña {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('hace clic en el botón de ingresar', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

Then('el sistema le permite el acceso y muestra la pantalla de productos en la url {string}', async function (this: CustomWorld, expectedPath: string) {
  const loginPage = new LoginPage(this.page);
  const currentPath = await loginPage.getCurrentPath();
  expect(currentPath).toBe(expectedPath);
});

Then('el sistema no le permite el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentPath = await loginPage.getCurrentPath();
  expect(currentPath).not.toContain('/inventory');
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentPath = await loginPage.getCurrentPath();
  expect(currentPath).not.toContain('/inventory');
});

Then('muestra el mensaje de error {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getErrorMessage();
  expect(actualMessage).toContain(expectedMessage);
});
