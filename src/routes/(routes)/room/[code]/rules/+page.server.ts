import { State, TOKEN, WinCondition } from '$lib/constants'
import { isGameMaster, throwIfNotFound } from '$lib/notFound'
import { room } from '$lib/schema.server'

import { fail, redirect, type Actions, type ServerLoad } from '@sveltejs/kit'
import { and, eq, inArray } from 'drizzle-orm'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'

const save = z.object({
	isWithFreeTile: z.boolean().optional(),
	isWithHiddenBoards: z.boolean().optional(),
	winCondition: z.enum([WinCondition.ALL_ROWS, WinCondition.FIRST_ROW])
})

export const load: ServerLoad = async (event) => {
	const player = await event.locals.db.query.player
		.findFirst({
			where: (player) =>
				and(
					eq(player.roomCode, String(event.params.code)),
					eq(player.userSecret, String(event.cookies.get(TOKEN)))
				),
			columns: {
				role: true
			},
			with: {
				room: {
					columns: {
						state: true,
						isWithFreeTile: true,
						isWithHiddenBoards: true,
						winCodition: true
					}
				}
			}
		})
		.catch(throwIfNotFound)

	return {
		save: superValidate(
			{
				isWithFreeTile: player.room.isWithFreeTile,
				isWithHiddenBoards: player.room.isWithHiddenBoards,
				winCondition: player.room.winCodition
			},
			save
		),
		RulesQuery: {
			role: player.role,
			room: {
				state: player.room.state
			}
		}
	}
}

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, save)

		if (!form.valid) {
			return fail(400, { create: form })
		}

		await event.locals.db
			.update(room)
			.set({
				isWithFreeTile: form.data.isWithFreeTile,
				isWithHiddenBoards: form.data.isWithHiddenBoards,
				winCodition: form.data.winCondition
			})
			.where(
				and(
					eq(room.code, String(event.params.code)),
					inArray(room.state, [State.SETUP, State.LOCKED]),
					isGameMaster(event.locals.db, {
						userSecret: String(event.cookies.get(TOKEN)),
						roomCode: String(event.params.code)
					})
				)
			)

		throw redirect(303, `/room/${event.params.code}/rules`)
	}
}
