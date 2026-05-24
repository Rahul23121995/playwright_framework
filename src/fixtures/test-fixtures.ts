import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { Logger } from '../utils/Logger';

// Define types for all page object fixtures
type PageObjectFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  loggedInPage: { page: any; inventoryPage: InventoryPage };
};

/**
 * Custom Playwright test runner extending standard behaviors with automated PO instantiation.
 * Eliminates setup boilerplate inside test files.
 */
export const test = base.extend<PageObjectFixtures>({
  // Instantiate LoginPage dynamically
  loginPage: async ({ page }, use) => {
    Logger.debug('Initializing LoginPage POM fixture...');
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Instantiate InventoryPage dynamically
  inventoryPage: async ({ page }, use) => {
    Logger.debug('Initializing InventoryPage POM fixture...');
    const inventoryPage = new InventoryPage(page);
    await use(inventoryPage);
  },

  // Instantiate CartPage dynamically
  cartPage: async ({ page }, use) => {
    Logger.debug('Initializing CartPage POM fixture...');
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // Instantiate CheckoutPage dynamically
  checkoutPage: async ({ page }, use) => {
    Logger.debug('Initializing CheckoutPage POM fixture...');
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // Logged-in page fixture that performs authentication before delivering page context
  loggedInPage: async ({ page, loginPage, inventoryPage }, use) => {
    Logger.info('Initializing pre-authenticated loggedInPage fixture...');
    
    const username = process.env.TEST_USERNAME || 'standard_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    
    // Perform navigation and login once for this context
    await loginPage.navigate();
    await loginPage.login(username, password);
    await inventoryPage.verifyHeaderTitle();
    
    Logger.info('Authentication successful. Handing over pre-authenticated context.');
    await use({ page, inventoryPage });
  }
});

export { expect } from '@playwright/test';
