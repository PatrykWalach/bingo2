import { client } from '$lib/db.server'
import { pusher } from '$lib/socket.server'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = ({ event, resolve }) => {
	event.locals.db = client
	event.locals.pusher = pusher

	return resolve(event)
}
