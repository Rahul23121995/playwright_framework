import { test } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/Logger';

test.describe('E2E Checkout User Journey', () => {

  test('Should purchase multiple items and verify checkout calculations', async ({ 
    loggedInPage, 
    cartPage, 
    checkoutPage 
  }) => {
    Logger.testStep('Starting Checkout E2E Scenario');
    
    // De-structure custom authenticated fixture
    const { inventoryPage } = loggedInPage;
    
    const productA = 'Sauce Labs Backpack';
    const productB = 'Sauce Labs Bolt T-Shirt';
    const priceA = 29.99;
    const priceB = 15.99;

    // 1. Add products to cart
    Logger.info('Step 1: Adding items to cart');
    await inventoryPage.addItemToCart(productA);
    await inventoryPage.addItemToCart(productB);

    // 2. Validate cart badge updates to 2
    Logger.info('Step 2: Checking cart badge updates');
    const badgeCount = await inventoryPage.getCartBadgeCount();
    if (badgeCount !== 2) {
      throw new Error(`Expected badge count to be 2, but got: ${badgeCount}`);
    }

    // 3. Navigate to Cart page and verify item listings
    Logger.info('Step 3: Navigating to cart details and checking item items');
    await inventoryPage.clickCartIcon();
    await cartPage.verifyCartPageHeader();
    await cartPage.verifyItemInCart(productA);
    await cartPage.verifyItemInCart(productB);

    // 4. Proceed to Checkout and complete Information Form
    Logger.info('Step 4: Navigating to customer details form');
    await cartPage.clickCheckout();
    await checkoutPage.fillInformationForm('Jane', 'Smith', '90210');

    // 5. Verify detailed overview calculations (Sum: 29.99 + 15.99 = 45.98)
    Logger.info('Step 5: Verifying review subtotal and tax calculation');
    const expectedSubtotal = priceA + priceB;
    await checkoutPage.verifyPriceCalculations(expectedSubtotal);

    // 6. Finalize order and assert success elements
    Logger.info('Step 6: Executing checkout transaction finish');
    await checkoutPage.clickFinish();
    await checkoutPage.verifyOrderCompleted();

    // 7. Verify Back Home navigation returns to catalog cleanly
    Logger.info('Step 7: Testing click back to products lobby');
    await checkoutPage.clickBackHome();
    await inventoryPage.verifyHeaderTitle();
    
    Logger.info('Checkout E2E Scenario completed and passed successfully!');
  });
});
