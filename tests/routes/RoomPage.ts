import type { Locator, Page } from '@playwright/test'

export default class RoomPage {
	code: Locator
	main: Locator
	constructor(private page: Page) {
		this.code = page.getByLabel('code')
		this.main = page.getByRole('main')
	}
}
