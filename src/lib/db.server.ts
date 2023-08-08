import { faker } from '@faker-js/faker/locale/en'

import type { Role } from './constants'

import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './relations.server'

export const client = drizzle(sql, { schema })

export type Client = typeof client

export const avatars = [
	{ alt: 'penguin', url: '/penguin_64.png' },
	{ alt: 'polar bear', url: '/polar_bear_64.png' },
	{ alt: 'reindeer', url: '/reindeer_64.png' },
	{ alt: 'seal', url: '/seal_64.png' },
	{ alt: 'snowy owl', url: '/snowy_owl_64.png' },
	{ alt: 'walrus', url: '/walrus_64.png' },
	{ alt: 'wolf', url: '/wolf_64.png' },
	{ alt: 'squirrel', url: '/squirrel_64.png' }
] as const

export function createAvatar() {
	return avatars[faker.number.int({ max: avatars.length - 1 })]
}

export function createPlayer() {
	return {
		avatar: createAvatar().url,
		color: faker.color.rgb(),
		name: faker.internet.displayName()
	}
}

export function addPlayer(args: { userSecret: string; role: Role; roomCode: string }) {
	return client
		.insert(player)
		.values({
			...createPlayer(),
			...args
		})
		.returning()
}

import { placeholder } from 'drizzle-orm'
import { player, user } from './schema.server'

const createUserStmt = client
	.insert(user)
	.values({
		secret: placeholder('secret'),
		id: crypto.randomUUID()
	})
	.returning()
	.prepare('createUser')

export function createUser(args: { secret: string }) {
	return createUserStmt.execute(args)
}
