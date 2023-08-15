import { faker } from '@faker-js/faker/locale/en'

import { createPool } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from './relations.server'

export const client = drizzle(
	createPool({
		connectionString: POSTGRES_URL
	}),
	{ schema }
)

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

import { POSTGRES_URL } from '$env/static/private'
