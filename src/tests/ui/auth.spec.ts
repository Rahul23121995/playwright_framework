import { test } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/Logger';

test.describe('Authentication Tests - SauceDemo', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    Logger.testStep('Navigating to SauceDemo Application');
    await loginPage.navigate();
  });

  test('Should login successfully with standard credentials', async ({ loginPage, inventoryPage }) => {
    Logger.testStep('Executing Positive Login Test');
    
    const username = process.env.TEST_USERNAME || 'standard_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    
    await loginPage.login(username, password);
    await inventoryPage.verifyHeaderTitle();
    
    Logger.info('Positive Login test passed.');
  });

  test('Should display error for locked out user', async ({ loginPage }) => {
    Logger.testStep('Executing Locked Out User Login Test');
    
    const username = process.env.LOCKED_OUT_USERNAME || 'locked_out_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    
    await loginPage.login(username, password);
    await loginPage.verifyLoginErrorContains('Epic sadface: Sorry, this user has been locked out.');
    
    Logger.info('Locked out user verification passed.');
  });

  test('Should display error for invalid credentials', async ({ loginPage }) => {
    Logger.testStep('Executing Invalid Login Details Test');
    
    await loginPage.login('invalid_user', 'wrong_password');
    await loginPage.verifyLoginErrorContains('Epic sadface: Username and password do not match any user in this service');
    
    Logger.info('Invalid login error verification passed.');
  });

  test('Should logout successfully', async ({ loginPage, inventoryPage, page }) => {
    Logger.testStep('Executing Session Logout Test');
    
    const username = process.env.TEST_USERNAME || 'standard_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    
    await loginPage.login(username, password);
    await inventoryPage.verifyHeaderTitle();

    // Interact with sidebar to logout
    Logger.info('Opening Sidebar Menu and clicking Logout');
    const burgerMenu = page.locator('#react-burger-menu-btn');
    const logoutButton = page.locator('#logout_sidebar_link');
    
    await burgerMenu.click();
    await logoutButton.waitFor({ state: 'visible' });
    await logoutButton.click();

    // Verify redirected back to Login screen
    await loginPage.verifyPageUrl();
    Logger.info('Logout flow verified successfully.');
  });
});
