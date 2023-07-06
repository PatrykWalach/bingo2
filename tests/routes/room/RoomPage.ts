import { expect, type Locator, type Page } from '@playwright/test'
import RoomLayout from './RoomLayout'

export class Tile {
	constructor(private locator: Locator) {}

	async complete() {
		await this.locator.getByRole('button', { name: 'complete' }).click()
		await expect.soft(this.locator.getByRole('button', { name: 'incomplete' })).toBeVisible()
	}
}

export default class RoomPage extends RoomLayout {
	async createTile(value: string) {
		await this.main.locator('#content').fill(value)
		await this.main.getByRole('button', { name: 'Create' }).click()
		const tile = this.main.getByRole('listitem').filter({ hasText: value })
		await expect.soft(tile).toBeVisible()
		return new Tile(tile)
	}

	async lock() {
		await this.main.getByRole('button', { name: 'Lock' }).click()
	}

	async start() {
		await this.main.getByRole('button', { name: 'Start' }).click()
	}

	code: Locator

	constructor(page: Page) {
		super(page)
		this.code = page.getByLabel('code')
	}
}
