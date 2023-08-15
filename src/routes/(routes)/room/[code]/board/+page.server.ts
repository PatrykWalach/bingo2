import { TOKEN } from '$lib/constants'
import { boardTile, room } from '$lib/schema.server'
import type { ServerLoad } from '@sveltejs/kit'
import { and, eq, exists } from 'drizzle-orm'

export const load: ServerLoad = (event) => {
	return {
		BoardQuery: event.locals.db.query.boardTile.findMany({
			where: and(
				eq(boardTile.playerRoomCode, String(event.params.code)),
				eq(boardTile.playerUserSecret, String(event.cookies.get(TOKEN))),
				exists(
					event.locals.db
						.select()
						.from(room)
						.where(
							and(eq(room.code, String(event.params.code)), eq(room.isWithHiddenBoards, false))
						)
				)
			),
			orderBy: boardTile.index,
			columns: {
				id: true
			},
			with: {
				tile: {
					columns: { isComplete: true, content: true }
				}
			}
		})
	}
}
