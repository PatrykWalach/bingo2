<script lang="ts">
	import '../app.css'


	import { invalidateAll } from '$app/navigation'

	import { page } from '$app/stores'
	import { pusher } from '$lib/socket'
	import { onDestroy, onMount } from 'svelte'
	import { derived } from 'svelte/store'

	let unsubscriber = () => {}

	onMount(() => {
		let clean = () => {}

		unsubscriber = derived(page, ($page) => $page.url.pathname).subscribe(
			(pathname) => {
				clean()
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
</script>

<slot />
<!-- <div class="">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
	</div>
</div> -->
