import type { Locator, Page } from '@playwright/test'

export default class RootLayout {
	protected nav: Locator
	public main: Locator
	constructor(protected page: Page) {
		this.main = page.getByRole('main')
		this.nav = page.getByRole('navigation')
	}
}
