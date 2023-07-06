import { expect, type Locator, type Page } from '@playwright/test'

export default class RoomLayout {
	protected nav: Locator
	public main: Locator
	constructor(protected page: Page) {
		this.main = page.getByRole('main')
		this.nav = page.getByRole('navigation')
	}

	async navigateToRules() {
		await this.nav.getByRole('link', { name: 'Rules' }).click()
		await expect.soft(this.page).toHaveTitle('Room rules')
		const RulesPage = await import('./RulesPage')
		return new RulesPage.default(this.page)
	}

	async navigateToTiles() {
		await this.nav.getByRole('link', { name: 'Tiles' }).click()
		await expect.soft(this.page).toHaveTitle(/Room.*/)
		const RoomPage = await import('./RoomPage')
		return new RoomPage.default(this.page)
	}
}
