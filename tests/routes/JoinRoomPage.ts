import { expect, type Locator, type Page } from '@playwright/test'
import RoomPage from './RoomPage'

export default class JoinRoomPage {
	async setAvatar(arg0: string) {
		await this.main
			.getByRole('img', {
				name: arg0
			})

			.click()
	}
	async setColor(color: `#${string}`) {
		await this.main.getByLabel('color').fill(color)
	}
	async setName(name: string) {
		await this.main.getByLabel('name').fill(name)
	}

	async joinRoom() {
		await this.main
			.getByRole('button', {
				name: 'Join'
			})
			.click()
		await expect.soft(this.page).toHaveTitle(/Room.*/)
		return new RoomPage()
	}
	main: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
	}
}
