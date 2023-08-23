import {
	boolean,
	foreignKey,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core'

export const winCondition = pgEnum('WinCondition', ['FIRST_ROW', 'ALL_ROWS'])
export const role = pgEnum('Role', ['GAME_MASTER', 'PLAYER'])
export const state = pgEnum('State', ['SETUP', 'LOCKED', 'RUNNING', 'DONE'])

export const room = pgTable('Room', {
	code: text('code').primaryKey().notNull(),
	name: text('name').notNull(),
	state: state('state').default('SETUP').notNull(),
	isWithFreeTile: boolean('isWithFreeTile').default(false).notNull(),
	isWithHiddenBoards: boolean('isWithHiddenBoards').default(false).notNull(),
	winCodition: winCondition('winCodition').default('FIRST_ROW').notNull()
})

export const boardTile = pgTable(
	'BoardTile',
	{
		id: uuid('id').primaryKey().notNull().defaultRandom(),
		tileId: text('tileId')
			.notNull()
			.references(() => tile.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
		playerRoomCode: text('playerRoomCode').notNull(),
		playerUserSecret: text('playerUserSecret').notNull(),
		index: serial('index').notNull()
	},
	(table) => {
		return {
			playerRoomCodePlayerUserSecretIndexKey: uniqueIndex(
				'BoardTile_playerRoomCode_playerUserSecret_index_key'
			).on(table.playerRoomCode, table.playerUserSecret, table.index),
			playerRoomCodePlayerUserSecretTileIdKey: uniqueIndex(
				'BoardTile_playerRoomCode_playerUserSecret_tileId_key'
			).on(table.tileId, table.playerRoomCode, table.playerUserSecret),
			boardTilePlayerRoomCodePlayerUserSecretFkey: foreignKey({
				columns: [table.playerRoomCode, table.playerUserSecret],
				foreignColumns: [player.roomCode, player.userSecret]
			})
				.onUpdate('cascade')
				.onDelete('restrict')
		}
	}
)

export const user = pgTable('User', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	secret: text('secret').notNull()
})

export const tile = pgTable(
	'Tile',
	{
		id: uuid('id').primaryKey().notNull().defaultRandom(),
		content: text('content').notNull(),
		isComplete: boolean('isComplete').default(false).notNull(),
		roomCode: text('roomCode').notNull(),
		userSecret: text('userSecret').notNull(),
		createdAt: timestamp('createdAt', { precision: 3, mode: 'string' }).defaultNow().notNull()
	},
	(table) => {
		return {
			tileRoomCodeUserSecretFkey: foreignKey({
				columns: [table.roomCode, table.userSecret],
				foreignColumns: [player.roomCode, player.userSecret]
			})
				.onUpdate('cascade')
				.onDelete('restrict')
		}
	}
)

export const boardRow = pgTable('BoardRow', {
	id: uuid('id').primaryKey().notNull().defaultRandom()
})

export const boardTileToRow = pgTable(
	'_BoardTileToRow',
	{
		boardTileId: text('boardTileId')
			.notNull()
			.references(() => boardTile.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
		rowId: text('rowId')
			.notNull()
			.references(() => boardRow.id, { onDelete: 'restrict', onUpdate: 'cascade' })
	},
	(table) => {
		return {
			rowIdBoardTileIdKey: uniqueIndex('_BoardTileToRow_rowId_boardTileId_key').on(
				table.boardTileId,
				table.rowId
			)
		}
	}
)

export const player = pgTable(
	'Player',
	{
		roomCode: text('roomCode')
			.notNull()
			.references(() => room.code, { onDelete: 'restrict', onUpdate: 'cascade' }),
		userSecret: text('userSecret')
			.notNull()
			.references(() => user.secret, { onDelete: 'restrict', onUpdate: 'cascade' }),
		name: text('name').notNull(),
		color: text('color').default('red').notNull(),
		avatar: text('avatar').default('/wolf_64.png').notNull(),
		role: role('role').default('PLAYER').notNull()
	},
	(table) => {
		return {
			playerPkey: primaryKey(table.roomCode, table.userSecret)
		}
	}
)
