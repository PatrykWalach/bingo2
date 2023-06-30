import type { Locator, Page } from '@playwright/test'
import RoomPage from './RoomPage'

export default class CreateRoomPage {
	async createRoom(args: { name: string }) {
		await this.name.fill(args.name)
		await this.main.getByRole('button', { name: 'create' }).click()
    return new RoomPage()
	}
	main: Locator
	name: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
		this.name = this.main.getByLabel('name')
	}
}
