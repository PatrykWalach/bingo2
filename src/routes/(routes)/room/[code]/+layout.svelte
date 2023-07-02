<script lang="ts">
	import { page } from '$app/stores'
	import { State } from '$lib/constants'
	import { Role } from '@prisma/client'
	import type { PageData } from './$types'
	export let data: PageData

	$: isDone = data.LayoutViewer.room.state === State.DONE
	$: isRunning = data.LayoutViewer.room.state === State.RUNNING || isDone
	$: isLocked = data.LayoutViewer.room.state === State.LOCKED || isRunning

	function comparingNumber<V>(key: (value: V) => number) {
		return (a: V, b: V) => key(a) - key(b)
	}

	$: players = data.LayoutViewer.room.players.sort(comparingNumber((player) => player._count.board))
</script>

<div class="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
	<div class="">
		<main class="grid gap-8 py-4 md:grid-cols-2 xl:grid-cols-3">
			<section class="flex flex-col gap-4">
				<div class="form-control">
					<label class="label" for={'code'}>
						<span class="label-text">Code</span>
					</label>
					<input
						class="input-primary input text-lg sm:input-lg sm:text-xl"
						id="code"
						type="text"
						readonly
						value={data.LayoutViewer.room.code}
					/>
				</div>

				<ul class="flex flex-col gap-1 py-4">
					{#each players as player (player.user.id)}
						<li class="">
							<div class="dropdown-hover dropdown w-full">
								<label tabindex="-1" class="w-full" for="">
									<div class="flex w-full gap-1">
										<div class="avatar m-2">
											<div
												class="w-12 rounded-full ring ring-[--color] ring-offset-2 ring-offset-base-100"
												style="--color: {player.color}"
											>
												<img src={player.avatar} alt="" />
											</div>
										</div>

										<div class="flex-1">
											<div class="flex items-center gap-1">
												<span class="text-lg">
													{player.name}
												</span>
												<span class="ml-auto text-xl">
													{isRunning ? player._count.board : ''}
												</span>
											</div>
											<div class="flex justify-between gap-1">
												<span class="text-md">
													{#if player.role === Role.GAME_MASTER}
														Game Master
													{/if}
												</span>
												<span class="text-xs">
													{#if player.user.id === data.LayoutViewer.user.id}
														You
													{/if}
												</span>
											</div>
										</div>
									</div>

									<ol
										tabindex="-1"
										class="{isRunning
											? 'grid'
											: 'hidden'} dropdown-content menu rounded-box z-[1] aspect-square w-52 grid-cols-5 grid-rows-5 items-stretch justify-items-stretch gap-1 bg-base-200 p-2 shadow"
									>
										{#each player.board as tile (tile.id)}
											<li
												class="m-0 h-auto rounded-sm {tile.tile.isComplete ? 'bg-primary' : ''}"
											/>
										{/each}
									</ol>
								</label>
							</div>
						</li>
					{/each}
				</ul>
			</section>
			<section class="grid gap-2 xl:col-span-2">
				<nav class="tabs tabs-boxed grid grid-cols-2">
					<a
						data-sveltekit-replacestate
						href="/room/{$page.params.code}"
						class="tab {$page.url.pathname === `/room/${$page.params.code}` ? 'tab-active' : ''}"
					>
						Tiles
					</a>
					<a
						href={isRunning ? `/room/${$page.params.code}/board` : undefined}
						class="tab {$page.url.pathname.startsWith(`/room/${$page.params.code}/board`)
							? 'tab-active'
							: isRunning
							? ''
							: 'tab-disabled'}"
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
