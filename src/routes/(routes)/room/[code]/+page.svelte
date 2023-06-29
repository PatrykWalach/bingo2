<script lang="ts">
	import TextInput from '$lib/TextInput.svelte'
	import { Role, State } from '$lib/constants'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	export let data: PageData

	const form = superForm(data.create)

	$: isSetup = data.Viewer.room.state === State.SETUP
	$: isGameMaster = data.Viewer.role === Role.GAME_MASTER
	$: isRunning = data.Viewer.room.state === State.RUNNING
	$: isDone = data.Viewer.role === State.DONE
	$: isLocked = data.Viewer.room.state === State.LOCKED
</script>

<svelte:head>
	<title>Room - {data.Viewer.room.name}</title>
</svelte:head>

<div class="">
	<div class="mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
		<main class="grid gap-2">
			<h1>{data.Viewer.room.name}</h1>

			<div class="form-control">
				<label class="label" for={'code'}>
					<span class="label-text">Code</span>
				</label>
				<input
					class="input-bordered input"
					id="code"
					type="text"
					readonly
					value={data.Viewer.room.code}
				/>
			</div>

			<ul>
				{#each data.Viewer.room.players as player (player.user.id)}
					<li>
						<div class="h-2 w-2" />
						{player.name}
						<div class="avatar">
							<div
								class="w-12 rounded-full ring ring-[--color] ring-offset-2 ring-offset-base-100"
								style="--color: {player.color}"
							>
								<img src={player.avatar} alt="" />
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<ul class="grid gap-2">
				{#each data.Tiles as tile (tile.id)}
					<li>
						<div
							class="card card-compact {tile.isComplete
								? 'bg-primary-focus text-primary-content'
								: 'bg-base-200'}"
						>
							<div class="card-body flex-row justify-between">
								<div class="card-title">
									{tile.content}
								</div>
								{#if isGameMaster || data.Viewer.user.id === tile.author.user.id}
									<div class="card-actions">
										{#if isGameMaster && isDone}
											<form action="?/toggle_tile">
												<button class="btn-primary btn-xs btn" type="submit">complete</button>
											</form>
										{/if}

										<label for="delete-tile-{tile.id}" class="btn-error btn-xs btn">delete</label>
									</div>
								{/if}
							</div>
						</div>
					</li>
				{/each}
			</ul>

			<div class="grid gap-2">
				{#if isSetup || (isLocked && isGameMaster)}
					<form method="post" action="?/create_tile" class="join flex">
						<TextInput {form} field="content" class="input-primary input join-item flex-1" />
						<button type="submit" class="btn-primary join-item btn">Create</button>
					</form>
				{/if}

				{#if isRunning || isDone}
					<a href="/" class="btn-primary btn w-full">Board</a>
					<a href="/" class="btn-primary btn w-full">Leaderboard</a>
				{/if}

				{#if (isSetup || isLocked) && isGameMaster}
					<div class="divider">Game master</div>
					<form method="post">
						<fieldset class="grid gap-2">
							<legend class="sr-only">Game master</legend>
							{#if isSetup}
								<button type="submit" formaction="?/lock_room" class="btn-accent btn">Lock</button>
							{:else if isLocked}
								<button type="submit" class="btn-primary btn" formaction="?/start_bingo">
									Start
								</button>
								<button type="submit" class="btn-accent btn" formaction="?/unlock_bingo">
									Unlock
								</button>
							{/if}
						</fieldset>
					</form>
				{/if}
			</div>
		</main>
	</div>
</div>

<footer class="sr-only">
	Image by <a
		href="https://www.freepik.com/free-vector/variety-animal-avatars_766787.htm#query=animal%20avatar&position=2&from_view=search&track=ais"
	>
		Freepik
	</a>
</footer>

{#each data.Tiles as tile (tile.id)}
	<input type="checkbox" id="delete-tile-{tile.id}" class="modal-toggle" />
	<div class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">Do you want to delete tile?</h3>
			<p class="">Click outside to cancel!</p>
			<div class="py-4">
				<p>
					<span class="font-semibold">{tile.author.name}!</span>
					-
					{tile.content}
				</p>
			</div>

			<form method="post" action="?/delete_tile" class="modal-action">
				<input type="hidden" value={tile.id} name="id" />
				<button class="btn-error btn" type="submit">delete</button>
			</form>
		</div>
		<label class="modal-backdrop" for="delete-tile-{tile.id}">Close</label>
	</div>
{/each}
