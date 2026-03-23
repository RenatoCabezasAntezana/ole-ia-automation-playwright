import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../page/LoginPage';
import { ENV } from '../../support/env';

// ---------------------------------------------------------------------------
// Mapa de perfiles → credenciales
// Nunca se hardcodean usuarios ni contraseñas aquí; todo viene de ENV.
// ---------------------------------------------------------------------------
interface Credentials {
  user: string;
  password: string;
}

const CREDENTIALS: Record<string, Credentials> = {
  // Login exitoso: admin válido
  usuario_valido: {
    user: ENV.CREDENTIALS.local.admin.user,
    password: ENV.CREDENTIALS.local.admin.password,
  },
  // Login con credenciales inválidas
  usuario_invalido: {
    user: ENV.CREDENTIALS.local.invalid.user,
    password: ENV.CREDENTIALS.local.invalid.password,
  },
  // Usuario bloqueado
  usuario_bloqueado: {
    user: ENV.CREDENTIALS.local.locked.user,
    password: ENV.CREDENTIALS.local.locked.password,
  },
  // Solo usuario completado (contraseña vacía)
  usuario_solo_user: {
    user: ENV.CREDENTIALS.local.admin.user,
    password: '',
  },
  // Solo contraseña completada (usuario vacío)
  usuario_solo_password: {
    user: '',
    password: ENV.CREDENTIALS.local.admin.password,
  },
};

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

Given('el usuario se encuentra en la página de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLogin();
});

// ---------------------------------------------------------------------------
// When
// ---------------------------------------------------------------------------

When(
  'ingresa el usuario {string} y hace clic en Login',
  async function (this: CustomWorld, perfil: string) {
    const creds = CREDENTIALS[perfil];
    if (!creds) throw new Error(`Perfil desconocido: "${perfil}"`);

    const loginPage = new LoginPage(this.page);
    await loginPage.login(creds.user, creds.password);
  },
);

When(
  'no ingresa ningún dato en los campos y hace clic en Login',
  async function (this: CustomWorld) {
    const loginPage = new LoginPage(this.page);
    await loginPage.clickSubmit();
  },
);

// ---------------------------------------------------------------------------
// Then
// ---------------------------------------------------------------------------

Then(
  've el mensaje {string}',
  async function (this: CustomWorld, mensajeEsperado: string) {
    const loginPage = new LoginPage(this.page);
    const mensajeActual = await loginPage.getAlertMessage();
    expect(mensajeActual.trim()).toBe(mensajeEsperado);
  },
);

Then(
  'es redirigido al dashboard en menos de 1.5 segundos',
  async function (this: CustomWorld) {
    const loginPage = new LoginPage(this.page);
    await loginPage.waitForRedirect('/dashboard', 1500);
    const url = await loginPage.getCurrentUrl();
    expect(url).toContain('/dashboard');
  },
);

Then('permanece en la página de login', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const url = await loginPage.getCurrentUrl();
  expect(url).toContain(ENV.BASE_URL);
  expect(url).not.toContain('/dashboard');
});
