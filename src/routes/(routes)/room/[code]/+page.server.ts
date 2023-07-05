import { Role, State, TOKEN } from '$lib/constants'
import { Prisma, WinCondition } from '@prisma/client'
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
			orderBy: { createdAt: 'asc' },
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
		Viewer: event.locals.db.player
			.findUniqueOrThrow({
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
			.catch((e) => {
				if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
					throw error(404, 'Sounds like skill issue!')
				}
				throw e
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
					author: {
						room: {
							state: {
								in: [State.SETUP, State.LOCKED]
							}
						}
					},
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
	toggle_tile: async (event) => {
		const form = await event.request.formData()
		const id = form.get('id')

		if (typeof id !== 'string') {
			throw error(400, 'No `id`!')
		}

		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.$transaction(async (transaction) => {
				const { isComplete, roomCode } = await transaction.tile.update({
					data: {
						isComplete: 'true' === form.get('isComplete')
					},
					where: {
						id,
						author: {
							room: {
								state: {
									not: State.DONE
								}
							}
						},
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

				if (!isComplete) {
					return
				}

				try {
					await transaction.bingo.update({
						data: { state: State.DONE },
						where: {
							state: State.RUNNING,
							code: roomCode,
							winCodition: WinCondition.FIRST_ROW,
							players: {
								some: {
									board: {
										some: {
											rows: {
												some: {
													tiles: {
														every: {
															tile: {
																isComplete: true
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					})
				} catch (e) {
					if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
						return
					}
					console.error(e)
					throw e
				}

				try {
					await transaction.bingo.update({
						data: { state: State.DONE },
						where: {
							state: State.RUNNING,
							code: roomCode,
							winCodition: WinCondition.ALL_ROWS,
							players: {
								some: {
									board: {
										every: {
											tile: {
												isComplete: true
											}
										}
									}
								}
							}
						}
					})
				} catch (e) {
					if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
						return
					}
					console.error(e)
					throw e
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
				const bingo = await transaction.bingo.update({
					data: {
						state: State.RUNNING
					},
					where: {
						state: State.LOCKED,
						code: event.params.code,
						players: {
							some: { role: Role.GAME_MASTER, userSecret: secret }
						}
					},
					include: {
						players: true
					}
				})

				const tiles = await transaction.tile.findMany({
					where: { roomCode: event.params.code }
				})

				if (tiles.length < 25) {
					throw error(400, 'At least 25 tiles are required!')
				}

				const freeTileId = crypto.randomUUID()

				await Promise.all(
					bingo.players.map((player) => {
						const vertical = Array.from({ length: 5 }, () => crypto.randomUUID())
						const horizontal = Array.from({ length: 5 }, () => crypto.randomUUID())
						const diagonal = Array.from({ length: 2 }, () => crypto.randomUUID())

						const boardTiles: Prisma.BoardTileCreateWithoutPlayerInput[] = getRandomElements(
							tiles,
							25
						).map(({ id }, i) => {
							const rows = [horizontal[i / 5], vertical[i % 5]]

							if (i % 5 === i / 5) {
								rows.push(diagonal[0])
							}

							if (4 - (i % 5) === i / 5) {
								rows.push(diagonal[0])
							}

							return Prisma.validator<Prisma.BoardTileCreateWithoutPlayerInput>()({
								index: i,
								tile: {
									connect: { id }
								},
								rows: {
									connectOrCreate: rows.map((id) => ({ create: {}, where: { id } }))
								}
							})
						})

						if (bingo.isWithFreeTile) {
							delete boardTiles[12].tile.connect
							boardTiles[12].tile.connectOrCreate = {
								create: {
									id: freeTileId,
									content: 'Free',
									isComplete: true,
									author: {
										connect: {
											roomCode_userSecret: {
												roomCode: event.params.code,
												userSecret: secret
											}
										}
									}
								},
								where: {
									id: freeTileId
								}
							}
						}

						return transaction.player.update({
							where: {
								roomCode_userSecret: {
									roomCode: player.roomCode,
									userSecret: player.userSecret
								}
							},
							data: {
								board: {
									create: boardTiles
								}
							}
						})
					})
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
