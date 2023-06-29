import { State, TOKEN } from '$lib/constants'
import { fail, redirect } from '@sveltejs/kit'
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

		const room = await event.locals.db.bingo.findUnique({
			where: {
				code: form.data.code
			},
			select: {
				_count: {
					select: {
						players: {
							where: {
								userSecret: secret
							}
						}
					}
				},
				state: true
			}
		})

		if (!room) {
			return setError(form, 'code', 'Room not found!')
		}
		
		if (room._count.players > 0) {
			throw redirect(303, `/room/${form.data.code}`)
		}
		
		if (room.state === State.SETUP) {
			throw redirect(303, `/join/${form.data.code}`)
		}

		return setError(form, 'code', 'Room not avalible!')

	}
}
