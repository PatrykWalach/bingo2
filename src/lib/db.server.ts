import { faker } from '@faker-js/faker/locale/en'
import { Prisma, PrismaClient } from '@prisma/client'
import type { Role } from './constants'

export const client = new PrismaClient({
	errorFormat: 'pretty'
})

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

export function addPlayer(args: { secret: string; role: Role }) {
	return Prisma.validator<Prisma.PlayerCreateNestedManyWithoutRoomInput>()({
		create: {
			role: args.role,
			...createPlayer(),
			user: createUser(args)
		}
	})
}

export function createUser(args: { secret: string }) {
	return Prisma.validator<Prisma.UserCreateNestedOneWithoutPlaysInput>()({
		connectOrCreate: {
			where: {
				secret: args.secret
			},
			create: {
				secret: args.secret
			}
		}
	})
}
