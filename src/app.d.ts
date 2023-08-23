// See https://kit.svelte.dev/docs/types#app

import type { Client } from '$lib/db.server'
import type Pusher from 'pusher'

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: Client
			pusher: Pusher
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export { }

