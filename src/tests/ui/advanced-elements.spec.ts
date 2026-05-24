import { test, expect } from '../../fixtures/test-fixtures';
import { Logger } from '../../utils/Logger';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Advanced UI Interactions - Custom Sandbox', () => {
  
  test.beforeEach(async ({ page }) => {
    Logger.testStep('Loading Local Automation Playground');
    const localHTMLPath = path.resolve(__dirname, 'playground.html');
    
    // Ensure the file exists before attempting navigation
    if (!fs.existsSync(localHTMLPath)) {
      throw new Error(`Local playground not found at: ${localHTMLPath}`);
    }
    
    await page.goto(`file://${localHTMLPath}`);
  });

  test('Should handle dynamic loading elements using auto-waiting', async ({ page }) => {
    Logger.testStep('Dynamic Waiting Verification');
    
    const startBtn = page.locator('#start-dynamic-btn');
    const loadingText = page.locator('#loading-text');
    const resultText = page.locator('#result-text');

    await startBtn.click();
    
    // Validate transient loading spinner is temporarily displayed
    await expect(loadingText).toBeVisible();
    
    // Playwright automatically retries assertion until timeout (10s max in config)
    Logger.info('Waiting for async operation to complete...');
    await expect(resultText).toBeVisible({ timeout: 5000 });
    await expect(resultText).toHaveText('Async content loaded successfully!');
    await expect(loadingText).toBeHidden();
    
    Logger.info('Dynamic wait verification passed.');
  });

  test('Should intercept and handle native browser dialog popups', async ({ page }) => {
    Logger.testStep('JavaScript Dialog Handling');

    // Intercept native JS confirm popup
    page.once('dialog', async (dialog) => {
      Logger.info(`Dialog intercepted: Message="${dialog.message()}", Type="${dialog.type()}"`);
      expect(dialog.message()).toBe('Do you approve this E2E test execution?');
      await dialog.accept(); // Simulates clicking "OK"
      Logger.info('Dialog approved and closed.');
    });

    const confirmBtn = page.locator('#confirm-btn');
    const responseTxt = page.locator('#confirm-response');

    await confirmBtn.click();
    
    // Assert response changes based on accepting the dialog
    await expect(responseTxt).toHaveText('Recruiter Approved E2E Test Execution!');
    Logger.info('JS dialog intercept verification passed.');
  });

  test('Should access elements encapsulated inside Shadow DOM', async ({ page }) => {
    Logger.testStep('Shadow DOM Piercing Selector Verification');

    // CRITICAL QA TRIVIA: Playwright locators automatically pierce shadow roots by default!
    // We can select elements inside open shadow roots as if they were in the normal DOM.
    const shadowText = page.locator('#shadow-host #shadow-text');
    
    await expect(shadowText).toBeVisible();
    await expect(shadowText).toHaveText('Hidden inside Shadow DOM context!');
    
    const shadowButton = page.locator('#shadow-host .shadow-btn');
    await shadowButton.click();
    Logger.info('Shadow DOM piercing selector successfully verified.');
  });

  test('Should interact with elements inside nested iFrames', async ({ page }) => {
    Logger.testStep('Nested Frame Handling');

    // Access nested document context using frameLocator
    const testFrame = page.frameLocator('#test-iframe');
    const iframeTitle = testFrame.locator('#iframe-title');
    const actionBtn = testFrame.locator('#iframe-click-btn');
    const statusText = testFrame.locator('#iframe-status');

    await expect(iframeTitle).toBeVisible();
    await expect(iframeTitle).toHaveText('Inside the Frame');
    
    await actionBtn.click();
    await expect(statusText).toHaveText('Clicked inside frame!');
    Logger.info('Frame interaction test passed.');
  });

  test('Should perform file uploads and downloads cleanly', async ({ page }) => {
    Logger.testStep('File Handling (Upload & Download) Testing');

    // 1. FILE UPLOAD
    Logger.info('Testing upload stream...');
    const uploadInput = page.locator('#file-uploader');
    const uploadStatus = page.locator('#upload-status');
    
    // Create a temporary mock file buffer to upload
    const mockFilePath = path.join(__dirname, 'temp-sample-upload.txt');
    fs.writeFileSync(mockFilePath, 'Playwright Portfolio Showcase Upload File');

    try {
      await uploadInput.setInputFiles(mockFilePath);
      await expect(uploadStatus).toHaveText('Successfully processed: temp-sample-upload.txt');
    } finally {
      // Clean up temporary local file safely
      if (fs.existsSync(mockFilePath)) {
        fs.unlinkSync(mockFilePath);
      }
    }

    // 2. FILE DOWNLOAD
    Logger.info('Testing download stream...');
    const downloadBtn = page.locator('#download-link-btn');

    // Register a download event listener before clicking download trigger
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const download = await downloadPromise;

    // Verify downloaded filename and path
    Logger.info(`Download completed. Suggested file name: "${download.suggestedFilename()}"`);
    expect(download.suggestedFilename()).toBe('showcase-verification.txt');

    // Optional: save downloaded file context to temp folder and delete
    const downloadSavePath = path.join(__dirname, download.suggestedFilename());
    await download.saveAs(downloadSavePath);
    expect(fs.existsSync(downloadSavePath)).toBe(true);
    fs.unlinkSync(downloadSavePath);

    Logger.info('File upload and download streams successfully verified.');
  });
});
