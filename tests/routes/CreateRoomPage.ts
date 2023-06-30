import { expect, type Locator, type Page } from '@playwright/test'
import JoinRoomPage from './JoinRoomPage'

export default class CreateRoomPage {
	async createRoom(args: { name: string }) {
		await this.name.fill(args.name)
		await this.main.getByRole('button', { name: 'create' }).click()
		await expect.soft(this.page).toHaveTitle("Join room")
    return new JoinRoomPage()
	}
	main: Locator
	name: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
		this.name = this.main.getByLabel('name')
	}
}
