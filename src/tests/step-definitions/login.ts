import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el cliente se encuentra en la pagina de inicio de sesion', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navegarAlLogin();
});

When('ingresa el usuario {string} y la contrasena {string}', async function (this: CustomWorld, usuario: string, contrasena: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.ingresarUsuario(usuario);
  await loginPage.ingresarContrasena(contrasena);
});

When('ingresa el usuario {string} y una contrasena incorrecta {string}', async function (this: CustomWorld, usuario: string, contrasena: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.ingresarUsuario(usuario);
  await loginPage.ingresarContrasena(contrasena);
});

When('hace clic en el boton de ingresar', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickLogin();
});

Then('el sistema le permite el acceso y muestra la pantalla principal de productos con la url {string}', async function (this: CustomWorld, urlEsperada: string) {
  const loginPage = new LoginPage(this.page);
  const urlActual = await loginPage.obtenerUrlActual();
  // La app redirige a /inventory.html — este assert fallará intencionalmente
  // El ticket exige /products como contrato del negocio
  expect(urlActual).toContain(urlEsperada);
});

Then('el sistema no permite el ingreso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const esVisible = await loginPage.esErrorVisible();
  expect(esVisible).toBe(true);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const esVisible = await loginPage.esErrorVisible();
  expect(esVisible).toBe(true);
});

Then('muestra el mensaje {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.obtenerMensajeError();
  expect(mensajeActual).toContain(mensajeEsperado);
});
