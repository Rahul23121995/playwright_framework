import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class LoginPage extends BasePage {
  protected readonly path = '/';

  // Locators defined using user-visible roles and attributes
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessageContainer: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = this.page.getByPlaceholder('Username');
    this.passwordInput = this.page.getByPlaceholder('Password');
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
    this.errorMessageContainer = this.page.locator('[data-test="error"]');
  }

  /**
   * Performs standard login procedure.
   */
  async login(username: string, password: string): Promise<void> {
    Logger.info(`Attempting login for user: "${username}"`);
    await this.enterText(this.usernameInput, username, 'Username Input Field');
    await this.enterText(this.passwordInput, password, 'Password Input Field', true);
    await this.clickElement(this.loginButton, 'Login Button');
  }

  /**
   * Asserts the existence and text content of a login error message.
   */
  async verifyLoginErrorContains(expectedText: string): Promise<void> {
    Logger.info(`Checking if error message contains: "${expectedText}"`);
    await expect(this.errorMessageContainer).toBeVisible();
    const actualError = await this.getElementText(this.errorMessageContainer, 'Error Message Container');
    expect(actualError).toContain(expectedText);
  }
}
