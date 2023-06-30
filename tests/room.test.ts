import { test } from '@playwright/test'
import HomePage from './routes/HomePage'

test('create room', async ({ page }) => {
	await page.goto('/')
	const home = new HomePage(page)
	const createroom = await home.navigateToCreateRoom()

	await createroom.setName('Gierka')
	const joinRoomPage = await createroom.createRoom()

	await joinRoomPage.setAvatar('snowy owl')
	await joinRoomPage.setColor('#fca15c')
	await joinRoomPage.setName('Foo')
	await joinRoomPage.joinRoom();
})
