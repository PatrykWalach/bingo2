import { faker } from '@faker-js/faker'
import { Prisma, PrismaClient } from '@prisma/client'
import type { Role } from './constants'

export const client = new PrismaClient({
	errorFormat: 'pretty'
})

export type Client = typeof client

export const avatars = [
	'/penguin_64.png',
	'/polar_bear_64.png',
	'/reindeer_64.png',
	'/seal_64.png',
	'/snowy_owl_64.png',
	'/walrus_64.png',
	'/wolf_64.png',
	'/squirrel_64.png'
] as const

export function createAvatar() {
	return avatars[faker.number.int({ max: avatars.length - 1 })]
}

export function createPlayer() {
	return {
		avatar: createAvatar(),
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
