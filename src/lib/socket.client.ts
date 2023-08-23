import { browser } from '$app/environment'
import { PUBLIC_PUSHER_KEY } from '$env/static/public'
import Pusher from 'pusher-js'
import { socketId } from './socket'

export const pusher = new Pusher(PUBLIC_PUSHER_KEY, {
	cluster: 'sa1'
})

if (browser) {
	pusher.connection.bind('connected', () => {
		socketId.set(pusher.connection.socket_id)
	})
}
