import { relations } from 'drizzle-orm'
import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { boardTile, player, room, tile, user } from './schema.server'

export * from './schema.server'

export const roomRelations = relations(room, ({ many }) => ({
	players: many(player)
}))

export const boardTileRelations = relations(boardTile, ({ one }) => ({
	tile: one(tile, {
		fields: [boardTile.tileId],
		references: [tile.id]
	}),
	player: one(player, {
		fields: [boardTile.playerRoomCode, boardTile.playerUserSecret],
		references: [player.roomCode, player.userSecret]
	})
}))
export const tileRelations = relations(tile, ({ one, many }) => ({
	authorUser: one(user, {
		fields: [tile.userSecret],
		references: [user.secret]
	}),
	author: one(player, {
		fields: [tile.userSecret, tile.roomCode],
		references: [player.userSecret, player.roomCode]
	})
}))

export const isCompleteTileCountTable = pgTable('is_complete_tilecount_view', {
	roomCode: text('roomCode').notNull(),
	userSecret: text('userSecret').notNull(),
	board: integer('board').notNull()
})

export const playerRelations = relations(player, ({ one, many }) => ({
	room: one(room, {
		fields: [player.roomCode],
		references: [room.code]
	}),
	user: one(user, {
		fields: [player.userSecret],
		references: [user.secret]
	}),
	board: many(boardTile),
	count: one(isCompleteTileCountTable, {
		fields: [player.roomCode, player.userSecret],
		references: [isCompleteTileCountTable.roomCode, isCompleteTileCountTable.userSecret]
	})
}))
