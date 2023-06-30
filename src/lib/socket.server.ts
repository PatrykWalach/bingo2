import { PUSHER_APP_ID, PUSHER_SECRET } from '$env/static/private'
import { PUBLIC_PUSHER_KEY } from '$env/static/public'
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUBLIC_PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: "sa1",
  useTLS: true
})
