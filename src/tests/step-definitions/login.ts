import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';

Given('que el usuario se encuentra en la pagina de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.irALogin();
});

When('ingresa el usuario {string} y la contrasena {string}', async function (this: CustomWorld, usuario: string, contrasena: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.ingresarUsuario(usuario);
  await loginPage.ingresarContrasena(contrasena);
});

When('hace clic en el boton {string}', async function (this: CustomWorld, _boton: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickIniciarSesion();
});

When('hace clic en el boton {string} sin completar ningun campo', async function (this: CustomWorld, _boton: string) {
  const loginPage = new LoginPage(this.page);
  await loginPage.clickIniciarSesion();
});

Then('ve el mensaje {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.obtenerMensajeAlerta();
  expect(mensajeActual).toContain(mensajeEsperado);
});

Then('es redirigido al dashboard en menos de 2 segundos', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.esperarRedireccionDashboard(2000);
});

Then('ve el mensaje de error {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.obtenerMensajeAlerta();
  expect(mensajeActual).toContain(mensajeEsperado);
});

Then('permanece en la pagina de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const url = await loginPage.obtenerURLActual();
  expect(url).not.toContain('/dashboard');
});
