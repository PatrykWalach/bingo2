import { and, eq, relations, sql } from 'drizzle-orm'
import { QueryBuilder, integer, pgTable, pgView, text } from 'drizzle-orm/pg-core'
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
export const tileRelations = relations(tile, ({ one }) => ({
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

export const isCompleteTileCountView = pgView('is_complete_tilecount_view').as((qb) =>
	qb
		.select({
			roomCode: player.roomCode,
			userSecret: player.userSecret,
			board: sql<number>`count(${tile.isComplete} = true)`.mapWith(Number).as('board')
		})
		.from(boardTile)
		.innerJoin(tile, eq(boardTile.tileId, tile.id))
		.rightJoin(
			player,
			and(
				eq(player.roomCode, boardTile.playerRoomCode),
				eq(player.userSecret, boardTile.playerUserSecret)
			)
		)
		.groupBy(player.roomCode, player.userSecret)
)

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
