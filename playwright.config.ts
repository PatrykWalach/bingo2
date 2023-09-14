import { devices, PlaywrightTestConfig } from '@playwright/test'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import * as dotenv from 'dotenv'
dotenv.config()

const url =
	process.env.ORIGIN ?? `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 5173}`

const config: PlaywrightTestConfig = {
	webServer: {
		command: process.env.CI ? 'bunx turbo preview' : 'npx turbo preview',
		url,
		timeout: 3 * 60 * 1000,
		reuseExistingServer: !process.env.CI
	},
	snapshotDir: './__snapshots__',
	maxFailures: 100,
	expect: {
		timeout: 10 * 1000
	},
	globalTimeout: 9 * 60 * 1000,
	/* Maximum time one test can run for. */
	timeout: 30 * 1000,
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 3 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 2 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: process.env.CI ? [['github'], ['html']] : 'list',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		baseURL: url,
		video: 'retain-on-failure'
	},
	testDir: join(dirname(fileURLToPath(import.meta.url)), 'tests'),
	projects: [
		{
			name: 'default'
		},
		{
			name: 'no-js',
			use: { javaScriptEnabled: false }
		},
		{
			name: 'mobile',
			use: { javaScriptEnabled: false, ...devices['Pixel 5'] }
		}
	]
}

export default config
