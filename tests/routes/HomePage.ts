import type { Page } from '@playwright/test'
import CreateRoomPage from './CreateRoomPage'
import JoinRoomPage from './JoinRoomPage'
import RootLayout from './RootLayout'

export default class HomePage extends RootLayout {
	async joinRoom() {
		await this.main.getByRole('button', { name: 'join' }).click()

		return JoinRoomPage.new(this.page)
	}
	async setCode(code: string) {
		await this.main.getByLabel('code').fill(code)
	}
	async navigateToCreateRoom() {
		await this.page.getByRole('link', { name: 'Or create room' }).click()

		return CreateRoomPage.new(this.page)
	}

	constructor(page: Page) {
		super(page)
	}
}
