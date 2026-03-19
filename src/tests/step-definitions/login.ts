import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { ENV } from '../../support/env';
import { LoginPage } from '../../page/LoginPage';

type CredentialProfile = 'usuario_valido' | 'usuario_bloqueado' | 'usuario_contrasena_errada';

const CREDENTIAL_MAP: Record<CredentialProfile, { user: string; password: string }> = {
  usuario_valido: ENV.CREDENTIALS.standard,
  usuario_bloqueado: ENV.CREDENTIALS.locked,
  usuario_contrasena_errada: ENV.CREDENTIALS.wrongPassword,
};

Given('que el cliente se encuentra en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  await loginPage.goToLoginPage();
});

When(
  'ingresa el usuario {string} y hace clic en Login',
  async function (this: CustomWorld, perfil: string) {
    const credentials = CREDENTIAL_MAP[perfil as CredentialProfile];
    if (!credentials) {
      throw new Error(`Perfil de credenciales desconocido: "${perfil}"`);
    }
    const loginPage = new LoginPage(this.page);
    await loginPage.login(credentials.user, credentials.password);
  }
);

Then(
  'el sistema lo redirige a la página principal de productos con la url {string}',
  async function (this: CustomWorld, expectedPath: string) {
    await this.page.waitForLoadState('networkidle');
    const loginPage = new LoginPage(this.page);
    const currentPath = await loginPage.getCurrentPath();
    expect(currentPath).toBe(expectedPath);
  }
);

Then('se muestra el título {string} en la pantalla', async function (this: CustomWorld, expectedTitle: string) {
  const loginPage = new LoginPage(this.page);
  const heading = await loginPage.getProductsHeading();
  expect(heading).toBe(expectedTitle);
});

Then('el sistema no permite el ingreso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const error = await loginPage.getErrorMessage();
  expect(error.length).toBeGreaterThan(0);
});

Then('el sistema deniega el acceso', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const error = await loginPage.getErrorMessage();
  expect(error.length).toBeGreaterThan(0);
});

Then(
  'muestra el mensaje de error {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    const loginPage = new LoginPage(this.page);
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain(expectedMessage);
  }
);

Then('el cliente permanece en la página de inicio de sesión', async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const currentPath = await loginPage.getCurrentPath();
  expect(currentPath).toBe('/');
});
