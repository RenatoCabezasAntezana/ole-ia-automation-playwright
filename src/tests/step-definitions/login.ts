import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el usuario se encuentra en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa el usuario {string} y la contrasena {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('hace clic en el boton {string}', async function (this: CustomWorld, _buttonLabel: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickSubmit();
});

When('hace clic en el boton {string} sin completar ningun campo', async function (this: CustomWorld, _buttonLabel: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickSubmit();
});

When('ingresa unicamente la contrasena {string} dejando el campo usuario vacio', async function (this: CustomWorld, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillPassword(password);
});

When('ingresa unicamente el usuario {string} dejando el campo contrasena vacio', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
});

Then('ve el mensaje {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getAlertMessage();
  expect(actualMessage.trim()).toBe(expectedMessage);
});

Then('es redirigido al dashboard en aproximadamente 1.2 segundos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.waitForDashboard();
});

Then('ve el mensaje de error {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getAlertMessage();
  expect(actualMessage.trim()).toBe(expectedMessage);
});

Then('permanece en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).not.toContain('/dashboard');
});

Then('ve el mensaje de bloqueo {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getAlertMessage();
  expect(actualMessage.trim()).toBe(expectedMessage);
});

Then('ve el mensaje de validacion {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getAlertMessage();
  expect(actualMessage.trim()).toBe(expectedMessage);
});
