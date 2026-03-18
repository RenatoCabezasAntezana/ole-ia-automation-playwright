import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el cliente se encuentra en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When('ingresa el nombre de usuario {string} y la contrasena {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('ingresa el nombre de usuario {string} y una contrasena incorrecta {string}', async function (this: CustomWorld, username: string, password: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
  await loginPage.fillPassword(password);
});

When('ingresa el nombre de usuario {string} y deja la contrasena en blanco', async function (this: CustomWorld, username: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.fillUsername(username);
});

When('hace clic en el boton de ingresar', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

When('hace clic en el boton de ingresar sin completar ningun campo', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLoginButton();
});

Then('el sistema le permite el acceso y muestra la pantalla principal de productos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isTitleVisible = await loginPage.isInventoryTitleVisible();
  expect(isTitleVisible).toBe(true);
  const titleText = await loginPage.getInventoryTitleText();
  expect(titleText).toBe('Products');
});

Then('la URL de la pagina es {string}', async function (this: CustomWorld, expectedPath: string) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).toContain(expectedPath);
});

Then('el sistema no permite el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isErrorVisible = await loginPage.isErrorMessageVisible();
  expect(isErrorVisible).toBe(true);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const isErrorVisible = await loginPage.isErrorMessageVisible();
  expect(isErrorVisible).toBe(true);
});

Then('muestra el mensaje de error {string}', async function (this: CustomWorld, expectedMessage: string) {
  const loginPage = new LoginPage(this.page);
  const actualMessage = await loginPage.getErrorMessage();
  expect(actualMessage).toContain(expectedMessage);
});

Then('el cliente permanece en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentUrl = await loginPage.getCurrentUrl();
  expect(currentUrl).toContain('/');
  const isLoginButtonVisible = await this.page.locator("[data-test='login-button']").isVisible();
  expect(isLoginButtonVisible).toBe(true);
});
