import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly alertMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.locator('#user-input');
    this.passwordInput = this.page.locator('#pass-input');
    this.submitButton = this.page.locator('#submit-btn');
    this.alertMessage = this.page.locator('#alertMessage');
  }

  async goToLogin(): Promise<void> {
    await this.navigate('/');
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

  async clickSubmit(): Promise<void> {
    await this.submitButton.waitFor({ state: 'visible' });
    await this.submitButton.click();
  }

  async getAlertMessage(): Promise<string> {
    await this.alertMessage.waitFor({ state: 'visible', timeout: 3000 });
    return (await this.alertMessage.textContent()) ?? '';
  }

  async waitForDashboardRedirect(): Promise<void> {
    await this.page.waitForURL('**/dashboard**', { timeout: 2000 });
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
