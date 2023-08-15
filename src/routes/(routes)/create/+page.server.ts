import { Role, TOKEN } from '$lib/constants'
import { createPlayer } from '$lib/db.server'
import { player, room as rooms, user } from '$lib/schema.server'
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

		const randomSecret = crypto.randomUUID()

		const secret = event.cookies.get(TOKEN) ?? randomSecret

		const room = await event.locals.db.transaction(async (tx) => {
			const [room] = await tx
				.insert(rooms)
				.values({
					code: faker.word.words(3).replaceAll(' ', '-'),
					name: form.data.name
				})
				.returning({ code: rooms.code })

			if (randomSecret === secret) {
				await tx.insert(user).values({
					secret,
					id: crypto.randomUUID()
				})
			}

			await tx.insert(player).values({
				role: Role.GAME_MASTER,
				userSecret: secret,
				roomCode: room.code,
				...createPlayer()
			})

			return room
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
