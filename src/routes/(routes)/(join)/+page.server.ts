import { State, TOKEN } from '$lib/constants'
import { player, room as rooms } from '$lib/schema.server'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions } from './$types'

const joinRoomSchema = z.object({
	code: z.string()
})

export const load = () => {
	return {
		form: superValidate(joinRoomSchema)
	}
}

export const actions: Actions = {
	join_room: async (event) => {
		const form = await superValidate(event, joinRoomSchema)

		if (!form.valid) {
			return fail(400, { form: form })
		}

		const secret = event.cookies.get(TOKEN) ?? crypto.randomUUID()

		const room = await event.locals.db.query.room.findFirst({
			where: eq(rooms.code, form.data.code),
			columns: { state: true },
			with: {
				players: {
					where: eq(player.userSecret, secret)
				}
			}
		})

		if (!room) {
			return setError(form, 'code', 'Room not found!')
		}

		if (room.players.length > 0) {
			throw redirect(303, `/room/${form.data.code}`)
		}

		if (room.state === State.SETUP) {
			throw redirect(303, `/join/${form.data.code}`)
		}

		return setError(form, 'code', 'Room not avalible!')
	}
}
