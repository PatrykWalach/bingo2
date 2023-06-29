import { State } from '$lib/constants'
import { client } from '$lib/db.server'
import { PrismaClient } from '@prisma/client'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = ({ event, resolve }) => {
	event.locals.db = client

	return resolve(event)
}
