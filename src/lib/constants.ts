export const TOKEN = 'bingo-token'

export enum Role {
	GAME_MASTER = 'GAME_MASTER',
	PLAYER = 'PLAYER'
}

export enum State {
	SETUP = 'SETUP',
	LOCKED = 'LOCKED',
	RUNNING = 'RUNNING',
	DONE = 'DONE'
}

export enum WinCondition {
	ALL_ROWS = 'ALL_ROWS',
	FIRST_ROW = 'FIRST_ROW'
}
