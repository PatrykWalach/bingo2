import { Role, State, TOKEN } from '$lib/constants'
import { avatars, createPlayer, createUser } from '$lib/db.server'
import { Prisma } from '@prisma/client'
import { fail, redirect, type ServerLoad } from '@sveltejs/kit'
import { setError, superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions } from './$types'

const joinRoomSchema = z.object({
	name: z.string(),
	avatar: z.enum(avatars),
	color: z.string()
})

export const load: ServerLoad = (event) => {
	return {
		avatars,
		form: superValidate(createPlayer(), joinRoomSchema)
	}
}

export const actions: Actions = {
	join_room: async (event) => {
		const form = await superValidate(event, joinRoomSchema)

		if (!form.valid) {
			return fail(400, { form: form })
		}

		const secret = event.cookies.get(TOKEN) ?? crypto.randomUUID()

		try {
			await event.locals.db.player.upsert({
				where: {
					roomCode_userSecret: {
						userSecret: secret,
						roomCode: event.params.code
					},
					room: {
						state: State.SETUP
					}
				},
				update: {
					avatar: form.data.avatar,
					color: form.data.color,
					name: form.data.name
				},
				create: {
					room: {
						connect: { code: event.params.code, state: State.SETUP }
					},
					role: Role.PLAYER,
					avatar: form.data.avatar,
					color: form.data.color,
					name: form.data.name,
					user: createUser({ secret })
				}
			})
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
				console.error(e)
				return setError(form, '', 'Bingo is not avalible anymore!')
			}
			console.error(e)
			throw e
		}

		const maxAge = 365 * 24 * 60

		event.cookies.set(TOKEN, secret, {
			path: '/',
			secure: false,
			httpOnly: true,
			sameSite: 'lax',
			expires: new Date(Date.now() + maxAge * 1000),
			maxAge
		})

		throw redirect(303, `/room/${event.params.code}`)
	}
}
