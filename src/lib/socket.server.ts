import { PUSHER_APP_ID, PUSHER_SECRET } from '$env/static/private'
import { PUBLIC_PUSHER_KEY } from '$env/static/public'
import { md5 } from 'crypto.web.js/dist/md5'

interface Args {
	appId: string
	key: string
	secret: string
	cluster: string
	useTLS: boolean
}

async function sha256(key: string, message: string) {
	const encoder = new TextEncoder()
	const data = encoder.encode(message)
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		encoder.encode(key),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	)
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
	const hashArray = Array.from(new Uint8Array(signature))
	const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
	return hashHex
}

class Pusher {
	private fetch: typeof fetch = fetch

	constructor(private args: Args) {}

	async trigger(
		channel: string | string[],
		name: string,
		data: {},
		options?: { socket_id?: string }
	) {
		const body = JSON.stringify({
			name,
			channels: [channel].flat(),
			data: JSON.stringify(data),
			...(options?.socket_id && { socket_id: options.socket_id })
		})

		const query = new URLSearchParams({
			auth_key: this.args.key,
			auth_timestamp: (Date.now() / 1000).toString(),
			auth_version: '1.0',
			body_md5: md5(body)
		})

		const method = 'POST'
		const baseUrl = `http://api-${this.args.cluster}.pusher.com`
		const path = `/apps/${this.args.appId}/events`

		query.sort()
		const signature = await sha256(this.args.secret, `${method}\n${path}\n${query}`)

		query.append('auth_signature', signature)

		try {
			const response = await this.fetch(`${baseUrl}${path}?${query}`, {
				method,
				body,
				headers: new Headers({
					'Content-Type': 'application/json'
				})
			})

			if (response.status === 400 || response.status === 401) {
				console.log(await response.text())
			} else if (response.status !== 200) {
				console.error(response.status)
			}
		} catch (e) {
			console.error(e)
		}
	}
}

export const pusher = new Pusher({
	appId: PUSHER_APP_ID,
	key: PUBLIC_PUSHER_KEY,
	secret: PUSHER_SECRET,
	cluster: 'sa1',
	useTLS: true
})
