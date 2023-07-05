import { TOKEN } from '$lib/constants'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = (event) => {
	return {
		RootLayout: event.locals.db.bingo.findMany({
			select: {
				code: true,
				name: true,
				state: true
			},
			take: 10,
			where: {
				players: {
					some: {
						userSecret: String(event.cookies.get(TOKEN))
					}
				}
			}
		})
	}
}
