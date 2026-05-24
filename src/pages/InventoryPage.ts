import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/Logger';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  private readonly pageHeaderTitle: Locator;
  private readonly shoppingCartLink: Locator;
  private readonly shoppingCartBadge: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeaderTitle = this.page.locator('.title');
    this.shoppingCartLink = this.page.locator('.shopping_cart_link');
    this.shoppingCartBadge = this.page.locator('.shopping_cart_badge');
    this.sortDropdown = this.page.locator('[data-test="product-sort-container"]');
  }

  /**
   * Asserts that the inventory page is currently loaded and active.
   */
  async verifyHeaderTitle(): Promise<void> {
    await this.verifyPageUrl();
    Logger.info('Verifying Inventory page header...');
    await expect(this.pageHeaderTitle).toBeVisible();
    await expect(this.pageHeaderTitle).toHaveText('Products');
  }

  /**
   * Add a specific item to the shopping cart by dynamic text match.
   */
  async addItemToCart(itemName: string): Promise<void> {
    Logger.info(`Adding item to cart: "${itemName}"`);
    const productCard = this.page.locator('.inventory_item', { hasText: itemName });
    const addToCartBtn = productCard.getByRole('button', { name: /add to cart/i });
    await this.clickElement(addToCartBtn, `Add to Cart button for "${itemName}"`);
  }

  /**
   * Remove a specific item from the shopping cart by dynamic text match.
   */
  async removeItemFromCart(itemName: string): Promise<void> {
    Logger.info(`Removing item from cart: "${itemName}"`);
    const productCard = this.page.locator('.inventory_item', { hasText: itemName });
    const removeBtn = productCard.getByRole('button', { name: /remove/i });
    await this.clickElement(removeBtn, `Remove button for "${itemName}"`);
  }

  /**
   * Retrieves the current count on the shopping cart badge.
   */
  async getCartBadgeCount(): Promise<number> {
    const badgeExists = await this.shoppingCartBadge.isVisible();
    if (!badgeExists) {
      Logger.debug('Cart badge is not visible (Count: 0).');
      return 0;
    }
    const badgeText = await this.getElementText(this.shoppingCartBadge, 'Shopping Cart Badge Count');
    const count = parseInt(badgeText, 10);
    Logger.debug(`Parsed cart badge count: ${count}`);
    return isNaN(count) ? 0 : count;
  }

  /**
   * Navigate to the Cart details page by clicking the cart link.
   */
  async clickCartIcon(): Promise<void> {
    await this.clickElement(this.shoppingCartLink, 'Shopping Cart Icon');
  }

  /**
   * Sort products by name or price options.
   * Values: az, za, lohi, hilo
   */
  async sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    Logger.info(`Sorting products by option code: "${sortOption}"`);
    await this.sortDropdown.selectOption(sortOption);
  }

  /**
   * Retrieve lists of all item titles on the screen.
   */
  async getAllProductNames(): Promise<string[]> {
    const itemNames = await this.page.locator('.inventory_item_name').allTextContents();
    Logger.debug(`Retrieved product names list: [${itemNames.join(', ')}]`);
    return itemNames;
  }
}
