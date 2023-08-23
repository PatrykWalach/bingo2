import { error } from '@sveltejs/kit'
import { and, eq, exists, type GetColumnData, type SQLWrapper } from 'drizzle-orm'
import { Role } from './constants'
import type { Client } from './db.server'
import { player } from './schema.server'

export function throwIfNotFound<T>(value: T) {
	if (!value) {
		throw error(404)
	}

	return value
}

export function isGameMaster(
	client: Client,
	{
		userSecret,
		roomCode
	}: {
		userSecret: GetColumnData<typeof player.userSecret, 'raw'> | SQLWrapper
		roomCode: GetColumnData<typeof player.roomCode, 'raw'> | SQLWrapper
	}
) {
	return exists(
		client
			.select()
			.from(player)
			.where(
				and(
					eq(player.role, Role.GAME_MASTER),
					eq(player.userSecret, userSecret),
					eq(player.roomCode, roomCode)
				)
			)
	)
}
