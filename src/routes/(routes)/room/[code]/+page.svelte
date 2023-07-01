<script lang="ts">
	import { enhance } from '$app/forms'
	import TextInput from '$lib/TextInput.svelte'
	import { Role, State } from '$lib/constants'
	import { socketId } from '$lib/socket'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	export let data: PageData

	const form = superForm(data.create)

	$: isGameMaster = data.Viewer.role === Role.GAME_MASTER
	$: isDone = data.LayoutViewer.room.state === State.DONE
	$: isRunning = data.LayoutViewer.room.state === State.RUNNING || isDone
	$: isLocked = data.LayoutViewer.room.state === State.LOCKED || isRunning
</script>

<svelte:head>
	<title>Room - {data.LayoutViewer.room.name}</title>
</svelte:head>

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
								<form action="?/toggle_tile" use:enhance>
									<button class="btn-primary btn-xs btn cursor-default" type="submit">
										complete
									</button>
									<input type="hidden" value={$socketId} name="socketId" />
								</form>
							{/if}

							<label for="delete-tile-{tile.id}" class="btn-error btn-xs btn">delete</label>
						</div>
					{/if}
				</div>
			</div>
		</li>
	{:else}
		<li>No tiles yet, create some</li>
	{/each}
</ul>

<div class="grid gap-2">
	{#if !isLocked || (!isRunning && isGameMaster)}
		<form use:enhance method="post" action="?/create_tile" class="join flex">
			<TextInput {form} field="content" class="input-primary input join-item flex-1" />
			<button type="submit" class="btn-primary join-item btn cursor-default">Create</button>
			<input type="hidden" value={$socketId} name="socketId" />
		</form>
	{/if}

	{#if isRunning }
		<a href="/" class="btn-primary btn w-full">Board</a>
		<a href="/" class="btn-primary btn w-full">Leaderboard</a>
	{/if}

	{#if ( !isRunning) && isGameMaster}
		<div class="divider">Game master</div>
		<form use:enhance method="post">
			<fieldset class="grid gap-2">
				<legend class="sr-only">Game master</legend>
				{#if !isLocked}
					<button type="submit" formaction="?/lock_room" class="btn-accent btn cursor-default">
						Lock
					</button>
				{:else if !isRunning}
					<button type="submit" class="btn-primary btn cursor-default" formaction="?/start_bingo">
						Start
					</button>
					<button type="submit" class="btn-accent btn cursor-default" formaction="?/unlock_bingo">
						Unlock
					</button>
				{/if}
			</fieldset>
			<input type="hidden" value={$socketId} name="socketId" />
		</form>
	{/if}
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

			<form use:enhance method="post" action="?/delete_tile" class="modal-action">
				<input type="hidden" value={tile.id} name="id" />
				<button class="btn-error btn cursor-default" type="submit">delete</button>

				<input type="hidden" value={$socketId} name="socketId" />
			</form>
		</div>
		<label class="modal-backdrop" for="delete-tile-{tile.id}">Close</label>
	</div>
{/each}
