import { expect, type Page } from '@playwright/test'
import RoomPage from './room/RoomPage'
import RootLayout from './RootLayout'

export default class JoinRoomPage extends RootLayout {
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

	async submit() {
		await this.main
			.getByRole('button', {
				name: 'Join'
			})
			.click()

		return RoomPage.new(this.page)
	}

	public static async new(page: Page) {
		await expect.soft(page).toHaveTitle('Join room')
		return new JoinRoomPage(page)
	}

	private constructor(page: Page) {
		super(page)
	}
}
