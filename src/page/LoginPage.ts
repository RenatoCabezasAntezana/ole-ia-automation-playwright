import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator("[data-test='username']");
    this.passwordInput = this.page.locator("[data-test='password']");
    this.loginButton = this.page.locator("[data-test='login-button']");
    this.errorContainer = this.page.locator("[data-test='error']");
  }

  async navigate(): Promise<void> {
    await super.navigate('/');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async fillUsername(user: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(user);
  }

  async fillPassword(pass: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(pass);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorContainer.waitFor({ state: 'visible' });
    return (await this.errorContainer.textContent()) ?? '';
  }

  getCurrentUrl(): string {
    return this.page.url();
  }
}
