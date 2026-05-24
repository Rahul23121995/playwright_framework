import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  private readonly pageHeaderTitle: Locator;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeaderTitle = this.page.locator('.title');
    this.cartItems = this.page.locator('.cart_item');
    this.checkoutButton = this.page.locator('[data-test="checkout"]');
    this.continueShoppingButton = this.page.locator('[data-test="continue-shopping"]');
  }

  /**
   * Validates that the cart page is loaded correctly.
   */
  async verifyCartPageHeader(): Promise<void> {
    await this.verifyPageUrl();
    Logger.info('Verifying Cart Page header...');
    await expect(this.pageHeaderTitle).toBeVisible();
    await expect(this.pageHeaderTitle).toHaveText('Your Cart');
  }

  /**
   * Asserts if an item exists inside the shopping cart page.
   */
  async verifyItemInCart(itemName: string): Promise<void> {
    Logger.info(`Checking if item exists in cart list: "${itemName}"`);
    const specificItem = this.cartItems.locator('.inventory_item_name', { hasText: itemName });
    await expect(specificItem).toBeVisible();
  }

  /**
   * Remove an item from within the shopping cart list.
   */
  async removeItemFromCart(itemName: string): Promise<void> {
    Logger.info(`Removing item inside cart list: "${itemName}"`);
    const cartItem = this.cartItems.filter({ hasText: itemName });
    const removeBtn = cartItem.getByRole('button', { name: /remove/i });
    await this.clickElement(removeBtn, `Remove Button inside cart list for "${itemName}"`);
  }

  /**
   * Click checkout button to proceed.
   */
  async clickCheckout(): Promise<void> {
    await this.clickElement(this.checkoutButton, 'Checkout Button');
  }

  /**
   * Return back to item grid catalog.
   */
  async clickContinueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton, 'Continue Shopping Button');
  }
}
