import { TOKEN } from '$lib/constants'
import { throwIfNotFound } from '$lib/notFound'
import { boardTile, player } from '$lib/schema.server'

import type { ServerLoad } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'

export const load: ServerLoad = (event) => {
	return {
		LayoutViewer: event.locals.db.query.player
			.findFirst({
				where: and(
					eq(player.roomCode, String(event.params.code)),
					eq(player.userSecret, String(event.cookies.get(TOKEN)))
				),
				columns: {

				},
				with: {
					user: { columns: { id: true } },
					room: {
						columns: {
							isWithHiddenBoards: true,
							code: true,
							name: true,
							state: true
						},
						with: {
							players: {
								columns: {
									color: true,
									avatar: true,
									role: true,
									name: true
								},
								with: {
									user: { columns: { id: true } },
									count: {
										columns: {
											board: true
										}
									},
									board: {
										orderBy: [boardTile.index],
										with: {
											tile: {
												columns: { isComplete: true }
											}
										},
										columns: {
											id: true
										}
									}
								}
							}
						}
					}
				}
			})
			.then(throwIfNotFound)
	}
}
