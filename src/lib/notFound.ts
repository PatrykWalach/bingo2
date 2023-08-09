import { error } from '@sveltejs/kit'

export function throwIfNotFound<T>(value: T) {
	if (!value) {
		throw error(404)
	}

	return value
}
