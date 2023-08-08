import { TOKEN } from '$lib/constants'
import { player } from '$lib/schema.server'
import type { ServerLoad } from '@sveltejs/kit'

import { eq } from 'drizzle-orm'

 

export const load: ServerLoad = (event) => {
	return {
		RootLayout: event.locals.db.query.player
		.findMany({
			where: eq(player.userSecret, String(event.cookies.get(TOKEN))),
			limit: 10,
			with: {
				room: {
					columns: {
						code: true,
						name: true,
						state: true
					}
				}
			}
		}) 
	}
}
