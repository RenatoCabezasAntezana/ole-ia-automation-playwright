import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

const CREDENTIALS: Record<string, { user: string; password: string }> = {
  usuario_valido: {
    user: ENV.CREDENTIALS.standard.user,
    password: ENV.CREDENTIALS.standard.password,
  },
  usuario_bloqueado: {
    user: ENV.CREDENTIALS.locked.user,
    password: ENV.CREDENTIALS.locked.password,
  },
  usuario_contrasena_errada: {
    user: ENV.CREDENTIALS.wrongPassword.user,
    password: ENV.CREDENTIALS.wrongPassword.password,
  },
};

Given('que el cliente se encuentra en la página de inicio de sesión de Swag Labs', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.navegar();
});

When('ingresa el usuario {string} y hace clic en Login', async function (this: CustomWorld, perfil: string) {
  const creds = CREDENTIALS[perfil];
  if (!creds) throw new Error(`Perfil desconocido: "${perfil}"`);
  const loginPage = new LoginPage(this.page);
  await loginPage.ingresarUsuario(creds.user);
  await loginPage.ingresarContrasena(creds.password);
  await loginPage.clickLogin();
});

Then('el sistema lo redirige a {string}', async function (this: CustomWorld, rutaEsperada: string) {
  const loginPage = new LoginPage(this.page);
  const urlActual = await loginPage.obtenerUrlActual();
  expect(urlActual).toContain(rutaEsperada);
});

Then('se muestra el catálogo de productos con el título {string}', async function (this: CustomWorld, tituloEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const titulo = await loginPage.obtenerTituloInventario();
  expect(titulo.trim()).toBe(tituloEsperado);
});

Then('el sistema no permite el ingreso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const urlActual = await loginPage.obtenerUrlActual();
  expect(urlActual).not.toContain('/inventory.html');
});

Then('permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const urlActual = await loginPage.obtenerUrlActual();
  expect(urlActual).toContain('/');
  expect(urlActual).not.toContain('/inventory.html');
});

Then('se muestra el mensaje de error {string}', async function (this: CustomWorld, mensajeEsperado: string) {
  const loginPage = new LoginPage(this.page);
  const mensajeActual = await loginPage.obtenerMensajeError();
  expect(mensajeActual).toContain(mensajeEsperado);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const urlActual = await loginPage.obtenerUrlActual();
  expect(urlActual).not.toContain('/inventory.html');
});
