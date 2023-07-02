<script lang="ts">
	import '../app.css'

	import { invalidateAll } from '$app/navigation'

	import { page } from '$app/stores'
	import { pusher } from '$lib/socket'
	import { onDestroy, onMount } from 'svelte'
	import { derived } from 'svelte/store'
	import type { LayoutData } from './$types'

	let unsubscriber = (): void => undefined

	const pathname = derived(page, ($page) => $page.url.pathname)

	onMount(() => {
		let clean = (): void => undefined

		unsubscriber = pathname.subscribe(
			(pathname) => {
				const channel = pusher.subscribe(pathname.replaceAll('/', '-'))

				function callback() {
					console.log('invalidate', pathname)
					invalidateAll()
				}

				console.log('bind', pathname)
				channel.bind('invalidate', callback)

				clean = () => {
					console.log('unbind', pathname)
					channel.unbind('invalidate', callback)
				}
			},
			() => clean()
		)
	})

	onDestroy(() => unsubscriber())

	export let data: LayoutData
</script>

<div class="drawer lg:drawer-open">
	<input id="drawer-input" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<slot />

		<label
			for="drawer-input"
			class="btn-primary drawer-button btn fixed bottom-4 right-4 cursor-default lg:hidden"
		>
			Open drawer
		</label>
	</div>
	<div class="drawer-side">
		<label for="drawer-input" class="drawer-overlay" />
		<ul class="menu h-full w-80 bg-base-200 p-4 text-base-content">
			{#each data.RootLayout as room (room.code)}
				<li><a href="/room/{room.code}">{room.name}</a></li>
			{:else}
				<li>No rooms yet, join some</li>
			{/each}
		</ul>
	</div>
</div>
