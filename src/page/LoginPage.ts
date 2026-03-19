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

  async goToLoginPage(): Promise<void> {
    await this.navigate('/');
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
  }

  async clickLoginButton(): Promise<void> {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return (await this.errorMessage.textContent()) ?? '';
  }

  async getCurrentPath(): Promise<string> {
    const url = new URL(this.page.url());
    return url.pathname;
  }

  async getProductsHeading(): Promise<string> {
    const heading = this.page.getByRole('heading', { name: 'Products' });
    await heading.waitFor({ state: 'visible' });
    return (await heading.textContent()) ?? '';
  }
}
