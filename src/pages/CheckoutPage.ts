import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-'; // Covers checkout-step-one, -step-two, -complete

  // Step One: Information Form Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly zipCodeInput: Locator;
  private readonly continueButton: Locator;

  // Step Two: Review & Overview Locators
  private readonly summarySubtotalLabel: Locator;
  private readonly summaryTaxLabel: Locator;
  private readonly summaryTotalLabel: Locator;
  private readonly finishButton: Locator;

  // Complete Locators
  private readonly completeHeader: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Step One
    this.firstNameInput = this.page.getByPlaceholder('First Name');
    this.lastNameInput = this.page.getByPlaceholder('Last Name');
    this.zipCodeInput = this.page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = this.page.locator('[data-test="continue"]');

    // Step Two
    this.summarySubtotalLabel = this.page.locator('.summary_subtotal_label');
    this.summaryTaxLabel = this.page.locator('.summary_tax_label');
    this.summaryTotalLabel = this.page.locator('.summary_total_label');
    this.finishButton = this.page.locator('[data-test="finish"]');

    // Complete
    this.completeHeader = this.page.locator('.complete-header');
    this.backHomeButton = this.page.locator('[data-test="back-to-products"]');
  }

  /**
   * Fills customer checkout details form and submits.
   */
  async fillInformationForm(firstName: string, lastName: string, zipCode: string): Promise<void> {
    Logger.info(`Filling step-one details: "${firstName} ${lastName}", ZIP: "${zipCode}"`);
    await this.enterText(this.firstNameInput, firstName, 'First Name Input');
    await this.enterText(this.lastNameInput, lastName, 'Last Name Input');
    await this.enterText(this.zipCodeInput, zipCode, 'Zip/Postal Code Input');
    await this.clickElement(this.continueButton, 'Continue Checkout Button');
  }

  /**
   * Verify Subtotal and Total calculations in Review screen.
   */
  async verifyPriceCalculations(expectedSubtotal: number, taxRate: number = 0.08): Promise<void> {
    Logger.info('Verifying overview invoice calculation details...');
    
    const subtotalText = await this.getElementText(this.summarySubtotalLabel, 'Subtotal Label');
    const actualSubtotal = parseFloat(subtotalText.replace('Item total: $', ''));
    expect(actualSubtotal).toBe(expectedSubtotal);
    Logger.info(`Subtotal match validated: Expected $${expectedSubtotal}, Actual: $${actualSubtotal}`);

    // Retrieve and log parsed tax label value
    const taxText = await this.getElementText(this.summaryTaxLabel, 'Tax Label');
    Logger.info(`Parsed tax: "${taxText}"`);

    // Verify final sum is approximately correct
    const totalText = await this.getElementText(this.summaryTotalLabel, 'Final Total Label');
    const actualTotal = parseFloat(totalText.replace('Total: $', ''));
    const expectedTotal = parseFloat((expectedSubtotal + parseFloat((expectedSubtotal * taxRate).toFixed(2))).toFixed(2));
    
    // Allow slight rounding differences in cent representations
    expect(Math.abs(actualTotal - expectedTotal)).toBeLessThanOrEqual(0.1);
    Logger.info(`Total sum verified: Expected ~$${expectedTotal}, Actual: $${actualTotal}`);
  }

  /**
   * Finalize transaction by clicking finish.
   */
  async clickFinish(): Promise<void> {
    await this.clickElement(this.finishButton, 'Finish Button');
  }

  /**
   * Verify successfully completed checkout message and header.
   */
  async verifyOrderCompleted(): Promise<void> {
    Logger.info('Asserting transaction completion state...');
    await expect(this.completeHeader).toBeVisible();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    Logger.info('Checkout flow validated successfully.');
  }

  /**
   * Return to main shopping lobby.
   */
  async clickBackHome(): Promise<void> {
    await this.clickElement(this.backHomeButton, 'Back Home Button');
  }
}
