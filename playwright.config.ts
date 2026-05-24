import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Enterprise-grade Playwright configuration.
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './src/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Capture screenshots on test failure. */
    screenshot: 'only-on-failure',

    /* Record video on test failure for easier debugging. */
    video: 'retain-on-failure',

    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 10000,
    
    /* Maximum time for navigation actions. */
    navigationTimeout: 15000,

    /* Define whether tests should run in headless mode. */
    headless: true,
  },

  /* Maximum time one test can run for. */
  timeout: 30000,

  /* Projects to configure for different platforms/browsers */
  projects: [
    /* UI Testing in Chromium */
    {
      name: 'Chromium UI',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*ui\/.*\.spec\.ts/,
    },

    /* UI Testing in Firefox */
    {
      name: 'Firefox UI',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*ui\/.*\.spec\.ts/,
    },

    /* UI Testing in WebKit (Safari engine) */
    {
      name: 'WebKit UI',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
      testMatch: /.*ui\/.*\.spec\.ts/,
    },

    /* API Testing Project - isolated from UI browsers */
    {
      name: 'API Tests',
      use: {
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
      testMatch: /.*api\/.*\.spec\.ts/,
    },
  ],
});
