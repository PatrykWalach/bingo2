import { TOKEN } from '$lib/constants'
import type { ServerLoad } from '@sveltejs/kit'

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
				user: { select: { id: true } },
				room: {
					select: {
						players: {
							select: {
								color: true,
								avatar: true,
								name: true,
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
	}
}
