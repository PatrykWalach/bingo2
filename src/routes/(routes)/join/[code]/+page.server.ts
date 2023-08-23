import { Role, State, TOKEN } from '$lib/constants'
import { avatars, createPlayer } from '$lib/db.server'

import { throwIfNotFound } from '$lib/notFound'
import { player, room as rooms, user } from '$lib/schema.server'
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions } from './$types'

const joinRoomSchema = z.object({
	name: z.string(),
	avatar: z.string(),
	color: z.string(),
	socketId: z.string().optional()
})

export const load: ServerLoad = () => {
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

		const randomSecret = crypto.randomUUID()

		const secret = event.cookies.get(TOKEN) ?? randomSecret

		if (!avatars.some(({ url }) => url === form.data.avatar)) {
			throw error(400, 'Avatar not valid!')
		}

		try {
			await event.locals.db.transaction(async (tx) => {
				const room = await tx.query.room
					.findFirst({
						where: and(eq(rooms.state, State.SETUP), eq(rooms.code, event.params.code))
					})
					.then(throwIfNotFound)

				if (randomSecret === secret) {
					await tx.insert(user).values({
						id: crypto.randomUUID(),
						secret
					})
				}

				await tx
					.insert(player)
					.values({
						userSecret: secret,
						role: Role.PLAYER,
						roomCode: room.code,
						avatar: form.data.avatar,
						color: form.data.color,
						name: form.data.name
					})
					.onConflictDoUpdate({
						set: {
							avatar: form.data.avatar,
							color: form.data.color,
							name: form.data.name
						},
						target: [player.userSecret, player.roomCode]
					})
			})
		} catch (e) {
			// if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
			// 	console.error(e)
			// 	return setError(form, '', 'Bingo is not avalible anymore!')
			// }
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

		event.locals.pusher.trigger(
			`/room/${event.params.code}`.replaceAll('/', '-'),
			'invalidate',
			{},
			{
				socket_id: form.data.socketId
			}
		)
		throw redirect(303, `/room/${event.params.code}`)
	}
}
