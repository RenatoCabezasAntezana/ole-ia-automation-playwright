import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usuarioInput: Locator;
  private readonly contrasenaInput: Locator;
  private readonly botonIniciarSesion: Locator;
  private readonly alerta: Locator;

  constructor(page: Page) {
    super(page);
    this.usuarioInput = this.page.getByRole('textbox', { name: 'Usuario' });
    this.contrasenaInput = this.page.getByRole('textbox', { name: 'Contraseña' });
    this.botonIniciarSesion = this.page.getByRole('button', { name: 'Iniciar sesion' });
    this.alerta = this.page.getByRole('alert');
  }

  async irALogin(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async ingresarUsuario(usuario: string): Promise<void> {
    await this.usuarioInput.waitFor({ state: 'visible' });
    await this.usuarioInput.fill(usuario);
  }

  async ingresarContrasena(contrasena: string): Promise<void> {
    await this.contrasenaInput.waitFor({ state: 'visible' });
    await this.contrasenaInput.fill(contrasena);
  }

  async clickIniciarSesion(): Promise<void> {
    await this.botonIniciarSesion.waitFor({ state: 'visible' });
    await this.botonIniciarSesion.click();
  }

  async obtenerMensajeAlerta(): Promise<string> {
    await this.alerta.waitFor({ state: 'visible' });
    return (await this.alerta.textContent()) ?? '';
  }

  async esperarRedireccionDashboard(timeoutMs: number): Promise<void> {
    await this.page.waitForURL('**/dashboard**', { timeout: timeoutMs });
  }

  async obtenerURLActual(): Promise<string> {
    return this.page.url();
  }
}
