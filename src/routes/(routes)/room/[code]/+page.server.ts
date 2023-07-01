import { Role, State, TOKEN } from '$lib/constants'
import { Prisma } from '@prisma/client/edge'
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions, RequestEvent } from './$types'

const create = z.object({
	content: z.string(),
	socketId: z.coerce.string().optional()
})

export const load: ServerLoad = (event) => {
	return {
		create: superValidate(create),
		Tiles: event.locals.db.tile.findMany({
			where: {
				roomCode: String(event.params.code)
			},
			select: {
				content: true,
				id: true,
				isComplete: true,
				author: {
					select: {
						avatar: true,
						name: true,
						user: {
							select: {
								id: true
							}
						}
					}
				}
			}
		}),
		Viewer: event.locals.db.player.findUniqueOrThrow({
			where: {
				roomCode_userSecret: {
					roomCode: String(event.params.code),
					userSecret: String(event.cookies.get(TOKEN))
				}
			},

			select: {
				role: true,
				user: { select: { id: true } },
				room: {
					select: {
						code: true,
						name: true,
						state: true,
						players: {
							select: {
								color: true,
								avatar: true,
								name: true,
								user: {
									select: {
										id: true
									}
								}
							}
						}
					}
				}
			}
		})
	}
}

export const actions: Actions = {
	create_tile: async (event) => {
		const form = await superValidate(event, create)

		if (!form.valid) {
			return fail(400, { form: form })
		}

		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.tile.create({
				data: {
					author: {
						connect: {
							roomCode_userSecret: {
								userSecret: secret,
								roomCode: event.params.code
							},
							room: {
								state: State.SETUP,
								players: {
									some: {
										userSecret: secret
									}
								}
							}
						}
					},
					content: form.data.content
				}
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
	},
	delete_tile: async (event) => {
		const form = await event.request.formData()
		const id = form.get('id')

		if (typeof id !== 'string') {
			throw error(400, 'No `id`!')
		}

		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.tile.delete({
				where: {
					id,
					OR: [
						{
							author: {
								room: {
									players: {
										some: {
											role: Role.GAME_MASTER,
											userSecret: secret
										}
									}
								}
							}
						},
						{
							author: {
								userSecret: secret
							}
						}
					]
				}
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		invalidateRoom(event, getSocketId(form))

		throw redirect(303, `/room/${event.params.code}`)
	},
	lock_room: async (event) => {
		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.bingo.update({
				data: {
					state: State.LOCKED
				},
				where: {
					state: State.SETUP,
					code: event.params.code,
					players: {
						some: { role: Role.GAME_MASTER, userSecret: secret }
					}
				}
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		getTokenId(event).then((socketId) => invalidateRoom(event, socketId))

		throw redirect(303, `/room/${event.params.code}`)
	},
	unlock_bingo: async (event) => {
		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.bingo.update({
				data: {
					state: State.SETUP
				},
				where: {
					state: State.LOCKED,
					code: event.params.code,
					players: {
						some: { role: Role.GAME_MASTER, userSecret: secret }
					}
				}
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		getTokenId(event).then((socketId) => invalidateRoom(event, socketId))

		throw redirect(303, `/room/${event.params.code}`)
	},
	start_bingo: async (event) => {
		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.$transaction(async (transaction) => {
				const players = await transaction.bingo
					.update({
						data: {
							state: State.RUNNING
						},
						where: {
							state: State.LOCKED,
							code: event.params.code,
							players: {
								some: { role: Role.GAME_MASTER, userSecret: secret }
							}
						}
					})
					.players()

				const tiles = await transaction.tile.findMany({
					where: { roomCode: event.params.code }
				})

				await Promise.all(
					players.map((player) =>
						transaction.player.update({
							where: {
								roomCode_userSecret: {
									roomCode: player.roomCode,
									userSecret: player.userSecret
								}
							},
							data: {
								board: {
									create: getRandomElements(tiles, 25).map(({ id }) => ({
										tile: {
											connect: { id }
										}
									}))
								}
							}
						})
					)
				)
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		getTokenId(event).then((socketId) => invalidateRoom(event, socketId))

		throw redirect(303, `/room/${event.params.code}`)
	}
}

function getSocketId(data: FormData) {
	const socketId = data.get('socketId')
	if (typeof socketId === 'string') {
		return socketId
	}
}

async function getTokenId(event: RequestEvent) {
	try {
		const data = await event.request.formData()
		return getSocketId(data)
	} catch (e) {
		console.error(e)
	}
}

function invalidateRoom(event: RequestEvent, socketId: string | undefined) {
	return event.locals.pusher.trigger(
		`/room/${event.params.code}`.replaceAll('/', '-'),
		'invalidate',
		{},
		{
			socket_id: socketId
		}
	)
}

function getSecretOrThrow(event: RequestEvent) {
	const secret = event.cookies.get(TOKEN)

	if (!secret) {
		throw error(401, 'Show yourself coward!')
	}

	return secret
}

function getRandomElements<T>(array: readonly T[], n: number): T[] {
	const shuffled = array.slice() // Create a shallow copy of the array
	let currentIndex = shuffled.length
	let temporaryValue, randomIndex
	const firstIndex = Math.max(shuffled.length - n, 0)

	// While there remain elements to shuffle
	while (currentIndex > firstIndex) {
		// Pick a remaining element
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1

		// Swap it with the current element
		temporaryValue = shuffled[currentIndex]
		shuffled[currentIndex] = shuffled[randomIndex]
		shuffled[randomIndex] = temporaryValue
	}

	// Return the last n elements
	return shuffled.slice(firstIndex)
}
