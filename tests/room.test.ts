import { expect, test } from '@playwright/test'
import HomePage from './routes/HomePage'
import type RoomPage from './routes/room/RoomPage'
import type { Tile } from './routes/room/RoomPage'

test('create room', async ({ page }) => {
	// given
	await page.goto('/')
	const home = new HomePage(page)
	const createroom = await home.navigateToCreateRoom()

	await createroom.setName('Gierka')
	const joinRoom = await createroom.submit()

	await joinRoom.setAvatar('snowy owl')
	await joinRoom.setColor('#fca15c')
	await joinRoom.setName('Foo')
	// when
	const room = await joinRoom.submit()
	// then
	await expect.soft(room.main.getByText('Foo')).toBeVisible()
})

test('join room', async ({ browser }) => {
	// given game master
	const gameMasterContext = await browser.newContext()
	const gameMasterPage = await gameMasterContext.newPage()
	await gameMasterPage.goto('/')
	const home = new HomePage(gameMasterPage)
	const createroom = await home.navigateToCreateRoom()

	await createroom.setName('Gierka')
	const joinRoom = await createroom.submit()

	await joinRoom.setAvatar('snowy owl')
	await joinRoom.setColor('#fca15c')
	await joinRoom.setName('Foo')
	const gameMasterRoom = await joinRoom.submit()
	const code = await gameMasterRoom.code.inputValue()

	// and player
	const playerContext = await browser.newContext()
	const playerPage = await playerContext.newPage()
	await playerPage.goto('/')
	const playerHome = new HomePage(playerPage)
	await playerHome.setCode(code)
	const playerJoinRoom = await playerHome.joinRoom()
	await playerJoinRoom.setAvatar('wolf')
	await playerJoinRoom.setColor('#a1fc5c')
	await playerJoinRoom.setName('Bar')
	// when
	const playerRoom = await playerJoinRoom.submit()
	// then
	await expect.soft(playerRoom.main.getByText('Foo')).toBeVisible()
	await expect.soft(playerRoom.main.getByText('Bar')).toBeVisible()

	await gameMasterContext.close()
	await playerContext.close()
})

import crypto from 'node:crypto'

const extended = test.extend<{ room: RoomPage }>({
	room: async ({ page }, use) => {
		// given
		await page.goto('/')
		const home = new HomePage(page)
		const createroom = await home.navigateToCreateRoom()

		await createroom.setName('Gierka')
		const joinRoom = await createroom.submit()

		await joinRoom.setAvatar('snowy owl')
		await joinRoom.setColor('#fca15c')
		await joinRoom.setName('Foo')
		// when
		const room = await joinRoom.submit()
		await use(room)
	}
})

extended('win all rows', async ({ room }) => {
	extended.slow()
	// given
	const tiles: Tile[] = []

	const rulespage = await room.navigateToRules()

	await rulespage.setWinCondition('ALL_ROWS')

	room = await rulespage.navigateToTiles()

	for (let i = 0; i < 25; i++) {
		tiles.push(await room.createTile(`Tile ${crypto.randomUUID()} `))
	}

	await room.lock()
	await room.start()
	for (const tile of tiles) {
		await tile.complete()
	}
	await expect
		.soft(room.main.locator('div').filter({ hasText: 'Foo 25 Game Master You' }))
		.toBeVisible()
})
