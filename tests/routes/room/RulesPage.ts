import RoomLayout from './RoomLayout'

export default class RulesPage extends RoomLayout {
	async setWinCondition(winCodition: 'ALL_ROWS' | 'FIRST_ROW') {
		await this.main.getByRole('combobox', { name: 'Win condition' }).selectOption('ALL_ROWS')
		await this.main
			.locator('form div')
			.filter({ hasText: 'Win condition First RowAll rows' })
			.locator('label')
			.nth(1)
			.selectOption(winCodition)
	}
}
