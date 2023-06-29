import { test } from '@playwright/test'

test('create room', async ({ page }) => {
	await page.goto('/')
	await page
		.getByRole('main')

		.getByLabel('name')
		.fill('Gierka')

	await page
		.getByRole('main')

		.getByRole('button', {
			name: 'Create'
		})
		.click()
})
