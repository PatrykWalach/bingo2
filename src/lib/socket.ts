import { PUBLIC_PUSHER_KEY } from '$env/static/public'
import Pusher from 'pusher-js'
import { writable, type Readable } from 'svelte/store'

export const pusher = new Pusher(PUBLIC_PUSHER_KEY, {
	cluster: 'sa1'
})

const _socketId = writable<string | undefined>()

if (window !== undefined) {
	pusher.connection.bind('connected', () => {
		_socketId.set(pusher.connection.socket_id)
	})
}

export const socketId: Readable<string | undefined> = _socketId
