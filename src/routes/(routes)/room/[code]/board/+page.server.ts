import { TOKEN } from '$lib/constants'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = (event) => {
	return {
		BoardQuery: event.locals.db.boardTile.findMany({
			where: {
				roomCode: String(event.params.code),
				userSecret: String(event.cookies.get(TOKEN)),
				player: {
					room: { isWithHiddenBoards: false }
				}
			},
			orderBy: {
				index: 'asc'
			},
			select: {
				id: true,
				tile: {
					select: { isComplete: true, content: true }
				}
			}
		})
	}
}
