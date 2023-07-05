import { TOKEN } from '$lib/constants'
import { Prisma } from '@prisma/client'
import { error, type ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = (event) => {
	return {
		LayoutViewer: event.locals.db.player
			.findUniqueOrThrow({
				where: {
					roomCode_userSecret: {
						roomCode: String(event.params.code),
						userSecret: String(event.cookies.get(TOKEN))
					}
				},
				select: {
					user: { select: { id: true } },
					room: {
						select: {
							isWithHiddenBoards: true,
							code: true,
							name: true,
							state: true,
							players: {
								select: {
									color: true,
									avatar: true,
									role: true,
									name: true,
									board: {
										orderBy: { index: 'asc' },
										select: {
											id: true,
											tile: {
												select: { isComplete: true }
											}
										}
									},
									_count: {
										select: {
											board: {
												where: {
													tile: {
														isComplete: true
													}
												}
											}
										}
									},
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
