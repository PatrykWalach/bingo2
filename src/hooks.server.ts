import { client } from '$lib/db.server'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = ({ event, resolve }) => {
	event.locals.db = client

	return resolve(event)
}
