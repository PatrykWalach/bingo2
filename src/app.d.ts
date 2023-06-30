// See https://kit.svelte.dev/docs/types#app

// import type { Client as PrismaClient } from './lib/db.server'
import type { PrismaClient } from '@prisma/client'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: PrismaClient
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {}
