import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator("[data-test='username']");
    this.passwordInput = this.page.locator("[data-test='password']");
    this.loginButton = this.page.locator("[data-test='login-button']");
    this.errorMessage = this.page.locator("[data-test='error']");
  }

  async navegarAlLogin(): Promise<void> {
    await this.navigate('');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async ingresarUsuario(usuario: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(usuario);
  }

  async ingresarContrasena(contrasena: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(contrasena);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async obtenerMensajeError(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return (await this.errorMessage.textContent()) ?? '';
  }

  async esErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async obtenerUrlActual(): Promise<string> {
    return this.page.url();
  }
}
