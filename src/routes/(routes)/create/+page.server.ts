import { Role, TOKEN } from '$lib/constants'
import { addPlayer } from '$lib/db.server'
import { faker } from '@faker-js/faker/locale/en'
import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions } from './$types'

const createRoomSchema = z.object({
	name: z.string()
})

export const load = () => {
	const name = faker.word.words(2).replaceAll(' ', '-')
	return {
		create: superValidate({ name }, createRoomSchema),
		namePlaceholder: name
	}
}

export const actions: Actions = {
	create_room: async (event) => {
		const form = await superValidate(event, createRoomSchema)

		if (!form.valid) {
			return fail(400, { create: form })
		}

		const secret = event.cookies.get(TOKEN) ?? crypto.randomUUID()

		const room = await event.locals.db.bingo.create({
			data: {
				code: faker.word.words(3).replaceAll(' ', '-'),
				name: form.data.name,
				players: addPlayer({
					role: Role.GAME_MASTER,
					secret
				})
			}
		})

		const maxAge = 365 * 24 * 60

		event.cookies.set(TOKEN, secret, {
			path: '/',
			secure: false,
			httpOnly: true,
			sameSite: 'lax',
			expires: new Date(Date.now() + maxAge * 1000),
			maxAge
		})

		throw redirect(303, `/join/${room.code}`)
	}
}
