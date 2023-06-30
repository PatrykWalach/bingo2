import { expect, type Locator, type Page } from '@playwright/test'
import CreateRoomPage from './CreateRoomPage'
import JoinRoomPage from './JoinRoomPage'

export default class HomePage {
	async joinRoom() {
		await this.main.getByRole('button', { name: 'join' }).click()
		await expect.soft(this.page).toHaveTitle('Join room')
		return new JoinRoomPage(this.page)
	}
	async setCode(code: string) {
		await this.main.getByLabel('code').fill(code)
	}
	async navigateToCreateRoom() {
		await this.page.getByRole('link', { name: 'Or create room' }).click()
		await expect.soft(this.page).toHaveTitle('Create room')
		return new CreateRoomPage(this.page)
	}
	main: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
	}
}
