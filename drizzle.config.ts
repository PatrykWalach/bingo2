import type { Config } from 'drizzle-kit'

export default {
	schema: './src/lib/schema.server.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		ssl: true,
		host: process.env.POSTGRES_HOST || '',
		password: process.env.POSTGRES_PASSWORD,
		user: process.env.POSTGRES_USER,
		database: process.env.POSTGRES_DATABASE || ''
	}
} satisfies Config
