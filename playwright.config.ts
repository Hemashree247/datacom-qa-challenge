// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

// Define the base URL for the challenge page
const BASE_URL = 'https://qa-practice.netlify.app/bugs-form'; 

export default defineConfig({
  // Look for test files inside the 'src/tests' directory
  testDir: './src/tests', 
  
  // Run tests in parallel for speed
  fullyParallel: true,
  
  // Forbid 'test.only' in CI environments
  forbidOnly: !!process.env.CI,
  
  // Retries tests only in CI environments
  retries: process.env.CI ? 2 : 0,
  
  // Workers/parallel jobs
  workers: process.env.CI ? 1 : undefined,
  
  // Use 'html' reporter to generate a report after execution
  reporter: 'html', 

  use: {
    // Base URL is used for page.goto('/') in tests
    baseURL: BASE_URL,
    
    // Capture trace of test execution when retrying a failed test
    trace: 'on-first-retry',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // You can add 'firefox' and 'webkit' here later if needed
  ],
});