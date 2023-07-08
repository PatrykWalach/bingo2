import { expect, type Locator, type Page } from '@playwright/test'
import JoinRoomPage from './JoinRoomPage'
import RootLayout from './RootLayout'

export default class CreateRoomPage extends RootLayout {
	async submit() {
		await this.main.getByRole('button', { name: 'Create' }).click()

		return JoinRoomPage.new(this.page)
	}

	async setName(name: string) {
		await this.name.fill(name)
	}

	name: Locator

	static async new(page: Page) {
		await expect.soft(page).toHaveTitle('Create room')
		return new CreateRoomPage(page)
	}

	private constructor(page: Page) {
		super(page)
		this.name = this.main.getByLabel('name')
	}
}
