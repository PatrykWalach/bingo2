import { TOKEN } from '$lib/constants'
import { Prisma, Role, State } from '@prisma/client'
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'

const save = z.object({
	isWithFreeTile: z.boolean()
})

export const load: ServerLoad = async (event) => {
	const player = await event.locals.db.player
		.findUniqueOrThrow({
			where: {
				roomCode_userSecret: {
					roomCode: String(event.params.code),
					userSecret: String(event.cookies.get(TOKEN))
				}
			},

			select: {
				role: true,
				room: {
					select: {
						isWithFreeTile: true
					}
				}
			}
		})
		.catch((e) => {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
				throw error(404, 'Sounds like skill issue!')
			}
			throw e
		})

	return {
		save: superValidate({ isWithFreeTile: player.room.isWithFreeTile }, save),
		RulesQuery: player
	}
}

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, save)

		if (!form.valid) {
			return fail(400, { create: form })
		}

		await event.locals.db.bingo.update({
			data: { isWithFreeTile: form.data.isWithFreeTile },
			where: {
				state: { in: [State.SETUP, State.LOCKED] },
				code: event.params.code,
				players: {
					some: {
						role: Role.GAME_MASTER,
						userSecret: event.cookies.get(TOKEN)
					}
				}
			}
		})

		throw redirect(303, `/room/${event.params.code}/rules`)
	}
}
