import type { Locator, Page } from '@playwright/test'
import RootLayout from '../RootLayout'

export default class RoomLayout extends RootLayout {


	async navigateToRules() {
		await this.nav.getByRole('link', { name: 'Rules' }).click()

		const RulesPage = await import('./RulesPage')
		return  RulesPage.default.new(this.page)
	}

	async navigateToTiles() {
		await this.nav.getByRole('link', { name: 'Tiles' }).click()
 
		const RoomPage = await import('./RoomPage')
		return  RoomPage.default.new(this.page)
	}
}
