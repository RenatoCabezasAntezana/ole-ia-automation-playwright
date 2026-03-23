import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('#username');
    this.passwordInput = this.page.locator('#password');
    this.loginButton = this.page.locator('#btnLogin');
    this.alertMessage = this.page.locator('#alertMessage');
  }

  async goToLogin(): Promise<void> {
    await this.navigate('');
    await this.waitForPageLoad();
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async getAlertMessage(): Promise<string> {
    await this.alertMessage.waitFor({ state: 'visible' });
    return (await this.alertMessage.textContent()) ?? '';
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForRedirect(timeoutMs: number): Promise<void> {
    await this.page.waitForURL((url) => !url.toString().endsWith('/'), {
      timeout: timeoutMs,
    });
  }
}
