import { Page, expect } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * Abstract BasePage representing the base class for all Page Object Models (POMs).
 * Enforces standardized element interaction methods with automatic logging.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page path using the base URL.
   */
  async navigate(): Promise<void> {
    Logger.info(`Navigating to page path: "${this.path}"`);
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the page load state to be fully loaded.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('domcontentloaded');
    Logger.debug(`Page "${this.path}" loaded successfully.`);
  }

  /**
   * Explicitly wait for an element to be visible on the page.
   * @param selector Locator, or string selector
   * @param elementName Readable element name
   * @param timeoutMs Custom timeout limit in milliseconds
   */
  async waitForElementToBeVisible(
    selector: string | any, 
    elementName: string, 
    timeoutMs: number = 5000
  ): Promise<void> {
    Logger.info(`Waiting for "${elementName}" to become visible...`);
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible', timeout: timeoutMs });
    Logger.debug(`"${elementName}" is now visible.`);
  }

  /**
   * Validate that the current URL matches the expected page path.
   */
  async verifyPageUrl(): Promise<void> {
    Logger.info(`Verifying current URL contains: "${this.path}"`);
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }

  /**
   * Get the page title.
   */
  async getPageTitle(): Promise<string> {
    const title = await this.page.title();
    Logger.debug(`Retrieved page title: "${title}"`);
    return title;
  }

  /**
   * Enhanced click helper with built-in logging.
   * @param selector Locator, or string selector
   * @param elementName Readable element name for logging
   */
  async clickElement(selector: string | any, elementName: string): Promise<void> {
    Logger.info(`Clicking on: "${elementName}"`);
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Enhanced input typing helper with logging and masking sensitive inputs.
   * @param selector Locator, or string selector
   * @param text Text value to enter
   * @param elementName Readable element name
   * @param maskText If true, masks text in logs (for passwords)
   */
  async enterText(
    selector: string | any, 
    text: string, 
    elementName: string, 
    maskText: boolean = false
  ): Promise<void> {
    const displayValue = maskText ? '********' : text;
    Logger.info(`Typing "${displayValue}" into: "${elementName}"`);
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible' });
    await locator.fill(text);
  }

  /**
   * Helper to retrieve text content of an element.
   */
  async getElementText(selector: string | any, elementName: string): Promise<string> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await locator.waitFor({ state: 'visible' });
    const text = await locator.textContent();
    Logger.debug(`Retrieved text from "${elementName}": "${text?.trim()}"`);
    return text ? text.trim() : '';
  }
}
