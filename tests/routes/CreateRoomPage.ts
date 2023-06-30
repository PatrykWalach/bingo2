import { expect, type Locator, type Page } from '@playwright/test'
import JoinRoomPage from './JoinRoomPage'

export default class CreateRoomPage {
	async submit() {
		await this.main.getByRole('button', { name: 'create' }).click()
		await expect.soft(this.page).toHaveTitle('Join room')
		return new JoinRoomPage(this.page)
	}

	async setName(name: string) {
		await this.name.fill(name)
	}

	main: Locator
	name: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
		this.name = this.main.getByLabel('name')
	}
}
