import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly campoUsuario: Locator;
  private readonly campoContrasena: Locator;
  private readonly botonLogin: Locator;
  private readonly mensajeError: Locator;
  private readonly tituloInventario: Locator;

  constructor(page: Page) {
    super(page);
    this.campoUsuario = this.page.locator("[data-test='username']");
    this.campoContrasena = this.page.locator("[data-test='password']");
    this.botonLogin = this.page.locator("[data-test='login-button']");
    this.mensajeError = this.page.locator("[data-test='error']");
    this.tituloInventario = this.page.locator("[data-test='title']");
  }

  async navegar(): Promise<void> {
    await this.navigate('/');
    await this.campoUsuario.waitFor({ state: 'visible' });
  }

  async ingresarUsuario(usuario: string): Promise<void> {
    await this.campoUsuario.waitFor({ state: 'visible' });
    await this.campoUsuario.fill(usuario);
  }

  async ingresarContrasena(contrasena: string): Promise<void> {
    await this.campoContrasena.waitFor({ state: 'visible' });
    await this.campoContrasena.fill(contrasena);
  }

  async clickLogin(): Promise<void> {
    await this.botonLogin.waitFor({ state: 'visible' });
    await this.botonLogin.click();
  }

  async obtenerMensajeError(): Promise<string> {
    await this.mensajeError.waitFor({ state: 'visible' });
    return (await this.mensajeError.textContent()) ?? '';
  }

  async obtenerUrlActual(): Promise<string> {
    return this.page.url();
  }

  async obtenerTituloInventario(): Promise<string> {
    await this.tituloInventario.waitFor({ state: 'visible' });
    return (await this.tituloInventario.textContent()) ?? '';
  }
}
