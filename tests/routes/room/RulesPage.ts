import { expect, type Page } from '@playwright/test'
import RoomLayout from './RoomLayout'

export default class RulesPage extends RoomLayout {
	async setWinCondition(winCodition: 'ALL_ROWS' | 'FIRST_ROW') {
		await this.main.getByRole('combobox', { name: 'Win condition' }).selectOption(winCodition)
	}

	static async new(page: Page) {
		await expect.soft(page).toHaveTitle('Room rules')
		return new RulesPage(page)
	}

	private constructor(page: Page) {
		super(page)
	}
}
