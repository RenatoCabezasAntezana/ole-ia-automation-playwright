import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el usuario está en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLogin();
});

When('ingresa el usuario {string} y la contraseña {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('hace clic en el botón {string}', async function (this: CustomWorld, _buttonText: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickSubmit();
});

When('hace clic en el botón {string} sin completar ningún campo', async function (this: CustomWorld, _buttonText: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickSubmit();
});

Then('ve el mensaje {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getAlertMessage();
  expect(actualMessage.trim()).toBe(expectedMessage);
});

Then('es redirigido al dashboard en menos de 2 segundos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.waitForDashboardRedirect();
});

Then('permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).not.toContain('/dashboard');
});
