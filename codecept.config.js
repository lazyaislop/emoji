export const config = {
  name: 'gh-emoji',
  tests: './tests/**/*.test.js',
  output: './tests/output',
  helpers: {
    Playwright: {
      url: process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173',
      browser: 'chromium',
      // Use the locally installed Chrome; no `npx playwright install` needed.
      channel: 'chrome',
      headless: process.env.HEADLESS !== 'false',
      restart: true,
      waitForTimeout: 10000,
    },
    AppServer: {
      require: './tests/helpers/appHelper.mjs',
    },
  },
  mocha: {
    timeout: 60000,
  },
}
