import { expect, type Locator, type Page } from '@playwright/test';
import CreateRoomPage from './CreateRoomPage';

export default class HomePage {
	async navigateToCreateRoom() {
		await this.page.getByRole('link', { name: 'Or create room' }).click()
		await expect.soft(this.page).toHaveTitle('Create room')
    return new CreateRoomPage(this.page);
	}
	main: Locator

	constructor(private page: Page) {
		this.main = this.page.getByRole('main')
	}
}
