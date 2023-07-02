import { writable } from 'svelte/store'

export const socketId = writable<string | undefined>()
