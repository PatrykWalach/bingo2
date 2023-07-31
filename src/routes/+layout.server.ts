import { TOKEN } from '$lib/constants'
import { player, room } from '$lib/schema.server'
import type { ServerLoad } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

export const load: ServerLoad = (event) => {
	return {
		RootLayout: event.locals.db
			.select({
				code: room.code,
				name: room.name,
				state: room.state
			})
			.from(room)
			.leftJoin(player, eq(player.roomCode, room.code))
			.where(eq(player.userSecret, String(event.cookies.get(TOKEN))))
			.limit(10)
	}
}
