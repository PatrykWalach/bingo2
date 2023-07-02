import { TOKEN } from '$lib/constants'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = (event) => {
	return {
		BoardQuery: event.locals.db.player.findUniqueOrThrow({
			where: {
				roomCode_userSecret: {
					roomCode: String(event.params.code),
					userSecret: String(event.cookies.get(TOKEN))
				}
			},

			select: {
				board: {
					orderBy: { id: 'asc' },
					select: {
						id: true,
						tile: {
							select: { content: true, isComplete: true }
						}
					}
				}
			}
		})
	}
}
