<script lang="ts">
	import { page } from '$app/stores'
	import { State } from '$lib/constants'
	import type { PageData } from './$types'
	export let data: PageData

	$: isSetup = data.LayoutViewer.room.state === State.SETUP
	$: isRunning = data.LayoutViewer.room.state === State.RUNNING
	$: isDone = data.LayoutViewer.room.state === State.DONE
	$: isLocked = data.LayoutViewer.room.state === State.LOCKED

	function comparingNumber<V>(key: (value: V) => number) {
		return (a: V, b: V) => key(a) - key(b)
	}

	$: players = data.LayoutViewer.room.players.sort(comparingNumber((player) => player._count.board))
</script>

<div class="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
	<div class="">
		<main class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
			<section class="flex flex-col gap-4">
				<h1>{data.LayoutViewer.room.name}</h1>

				<div class="form-control">
					<label class="label" for={'code'}>
						<span class="label-text">Code</span>
					</label>
					<input
						class="input-bordered input"
						id="code"
						type="text"
						readonly
						value={data.LayoutViewer.room.code}
					/>
				</div>

				<ul class="flex flex-col gap-4 py-4">
					{#each players as player (player.user.id)}
						<li class="flex items-center gap-4">
							<div class="avatar">
								<div
									class="w-12 rounded-full ring ring-[--color] ring-offset-2 ring-offset-base-100"
									style="--color: {player.color}"
								>
									<img src={player.avatar} alt="" />
								</div>
							</div>
							<span class="text-lg">
								{player.name}
							</span>
							<span class="ml-auto text-xl">{isRunning || isDone ? player._count.board : ''}</span>
						</li>
					{/each}
				</ul>
			</section>
			<section class="grid gap-2 xl:col-span-2">
				<nav class="tabs tabs-boxed grid grid-cols-2">
					<a data-sveltekit-replacestate href="/room/{$page.params.code}" class="tab tab-active">
						Tiles
					</a>
					<a
						href={isRunning || isDone ? '/room/{$page.params.code}/board' : undefined}
						class="tab {isRunning || isDone ? '' : 'tab-disabled'}"
						data-sveltekit-replacestate
					>
						Board
					</a>
				</nav>

				<slot />
			</section>
		</main>
	</div>
</div>
