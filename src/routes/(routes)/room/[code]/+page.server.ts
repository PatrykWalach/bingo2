import { Role, State, TOKEN } from '$lib/constants'
import { Prisma, WinCondition } from '@prisma/client'
import { error, fail, redirect, type ServerLoad } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { z } from 'zod'
import type { Actions, RequestEvent } from './$types'

const createTile = z.object({
	content: z.string(),
	socketId: z.coerce.string().optional()
})

const deleteTile = z.object({
	id: z.string(),
	socketId: z.coerce.string().optional()
})

const completeTile = z.object({
	id: z.string(),
	socketId: z.coerce.string().optional(),
	isComplete: z.coerce.boolean()
})

const lockRoom = z.object({
	socketId: z.coerce.string().optional()
})
const unlockRoom = z.object({
	socketId: z.coerce.string().optional()
})
const startRoom = z.object({
	socketId: z.coerce.string().optional()
})

export const load: ServerLoad = (event) => {
	return {
		createTile: superValidate(createTile),
		deleteTile: superValidate(deleteTile),
		completeTile: superValidate(completeTile),
		lockRoom: superValidate(lockRoom, { id: 'lockRoom' }),
		unlockRoom: superValidate(unlockRoom, { id: 'unlockRoom' }),
		startRoom: superValidate(startRoom, { id: 'startRoom' }),

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
		const form = await superValidate(event, createTile)

		if (!form.valid) {
			return fail(400, { createTile: form })
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
		const form = await superValidate(event, deleteTile)

		if (!form.valid) {
			return fail(400, { deleteTile: form })
		}

		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.tile.delete({
				where: {
					id: form.data.id,
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

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
	},
	toggle_tile: async (event) => {
		const form = await superValidate(event, completeTile)

		if (!form.valid) {
			return fail(400, { completeTile: form })
		}

		const secret = getSecretOrThrow(event)

		try {
			await event.locals.db.$transaction(async (transaction) => {
				const { isComplete, roomCode } = await transaction.tile.update({
					data: {
						isComplete: !form.data.isComplete
					},
					where: {
						id: form.data.id,
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
													row: {
														tiles: {
															every: {
																tile: {
																	tile: { isComplete: true }
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

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
	},
	lock_room: async (event) => {
		const form = await superValidate(event, lockRoom)

		if (!form.valid) {
			return fail(400, { lockRoom: form })
		}

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

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
	},
	unlock_bingo: async (event) => {
		const form = await superValidate(event, unlockRoom)

		if (!form.valid) {
			return fail(400, { unlockRoom: form })
		}

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

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
	},
	start_bingo: async (event) => {
		const form = await superValidate(event, startRoom)

		if (!form.valid) {
			return fail(400, { startRoom: form })
		}

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

				const rows: Prisma.RowCreateManyInput[] = []
				const boardTileToRows: Prisma.BoardTileToRowCreateManyInput[] = []
				const boardTiles = bingo.players.flatMap((player) => {
					const vertical = Array.from({ length: 5 }, () => crypto.randomUUID())
					const horizontal = Array.from({ length: 5 }, () => crypto.randomUUID())
					const diagonal = Array.from({ length: 2 }, () => crypto.randomUUID())

					rows.push(...vertical.map((id) => ({ id })))
					rows.push(...horizontal.map((id) => ({ id })))
					rows.push(...diagonal.map((id) => ({ id })))

					return getRandomElements(tiles, 25).map((tile, i) => {
						const rows = [horizontal[Math.floor(i / 5)], vertical[i % 5]]

						if (i % 5 === Math.floor(i / 5)) {
							rows.push(diagonal[0])
						}

						if (4 - (i % 5) === Math.floor(i / 5)) {
							rows.push(diagonal[1])
						}

						const id = crypto.randomUUID()
						boardTileToRows.push(...rows.map((rowId) => ({ boardTileId: id, rowId })))
						return Prisma.validator<Prisma.BoardTileCreateManyInput>()({
							id,
							index: i,
							tileId: tile.id,
							roomCode: player.roomCode,
							userSecret: player.userSecret
						})
					})
				})

				if (bingo.isWithFreeTile) {
					const freeTile = await transaction.tile.create({
						data: {
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
						}
					})

					for (const boardTile of boardTiles.filter(({ index }) => index === 12)) {
						boardTile.tileId = freeTile.id
					}
				}

				await Promise.all([
					transaction.boardTile.createMany({ data: boardTiles }),
					transaction.row.createMany({ data: rows })
				])
				await transaction.boardTileToRow.createMany({ data: boardTileToRows })
			})
		} catch (e) {
			console.error(e)
			throw e
		}

		invalidateRoom(event, form.data.socketId)

		throw redirect(303, `/room/${event.params.code}`)
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
