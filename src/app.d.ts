// See https://kit.svelte.dev/docs/types#app

import type { VercelPgDatabase } from 'drizzle-orm/vercel-postgres'
import type Pusher from 'pusher'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: VercelPgDatabase<Record<string, never>>
			pusher: Pusher
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {}
