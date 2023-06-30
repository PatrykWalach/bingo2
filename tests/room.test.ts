import { test } from '@playwright/test'
import HomePage from './routes/HomePage'

test('create room', async ({ page }) => {
	await page.goto('/')
	const home = new HomePage(page)
	const createroom = await home.navigateToCreateRoom()

	await createroom.createRoom({ name: 'Gierka' })
})
