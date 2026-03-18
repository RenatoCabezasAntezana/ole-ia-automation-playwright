import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el cliente se encuentra en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

When('ingresa el nombre de usuario {string} y la contraseña {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('ingresa el nombre de usuario {string} y una contraseña incorrecta {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('hace clic en el botón de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLogin();
});

Then('el sistema le permite el ingreso y muestra la pantalla principal de productos', async function (this: CustomWorld) {
  await this.page.waitForLoadState('networkidle');
  expect(this.page.url()).toContain('/inventory.html');
});

Then('la URL de la página contiene {string}', async function (this: CustomWorld, expectedPath: string) {
  expect(this.page.url()).toContain(expectedPath);
});

Then('el sistema no permite el ingreso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage.length).toBeGreaterThan(0);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage.length).toBeGreaterThan(0);
});

Then('se muestra el mensaje de error {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getErrorMessage();
  expect(actualMessage).toContain(expectedMessage);
});

Then('la URL permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = loginPage.getCurrentUrl();
  expect(currentUrl).not.toContain('/inventory.html');
});
