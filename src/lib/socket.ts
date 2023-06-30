import { PUBLIC_PUSHER_KEY } from '$env/static/public'
import Pusher from 'pusher-js'

export const pusher = new Pusher(PUBLIC_PUSHER_KEY, {
	cluster: 'sa1'
})
