import { TOKEN } from "$lib/constants"
import type { ServerLoad } from "@sveltejs/kit"

export const load: ServerLoad = (event) => {
	return {
		Viewer: event.locals.db.player.findUniqueOrThrow({
			where: {
				roomCode_userSecret: {
					roomCode: String(event.params.code),
					userSecret: String(event.cookies.get(TOKEN))
				}
			},

			select: {
				board: {
					select: {
						id: true,
						tile: {
							select: {
								content: true,
								isComplete: true
							}
						}
					}
				}
			}
		})
	}
}
