<script lang="ts">
	import TextInput from '$lib/TextInput.svelte'
	import { Role, State } from '$lib/constants'
	import { socketId } from '$lib/socket'
	import { derived } from 'svelte/store'
	import type { SuperValidated } from 'sveltekit-superforms'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	import type { ZodValidation } from 'sveltekit-superforms'
	import type { AnyZodObject } from 'zod'

	export let data: PageData

	const createTile = superForm(data.createTile)
	const lockRoom = superForm(data.lockRoom, {  })
	const unlockRoom = superForm(data.unlockRoom, {  })
	const startRoom = superForm(data.startRoom, {  })
	const { delayed: createDelayed, formId: createId } = createTile
	const { delayed: lockDelayed, formId: lockId } = lockRoom
	const { delayed: startDelayed, formId: startId } = startRoom
	const { delayed: unlockDelayed, formId: unlockId } = unlockRoom

	$: isGameMaster = data.Viewer.role === Role.GAME_MASTER
	$: isDone = data.LayoutViewer.room.state === State.DONE
	$: isRunning = data.LayoutViewer.room.state === State.RUNNING || isDone
	$: isLocked = data.LayoutViewer.room.state === State.LOCKED || isRunning

	function deriveForms<
		T extends ZodValidation<AnyZodObject> = ZodValidation<AnyZodObject>,
		M = any
	>(keys: string[], { form, formId }: { form: SuperValidated<T, M>; formId: string }) {
		const tiles = keys.map((key) => [key, superForm(form, { id: formId + key })] as const)

		const delayes = derived(
			tiles.map(([id, complete]) =>
				derived(complete.delayed, ($delayed) => [id, $delayed] as const)
			),
			(values) => Object.fromEntries(values)
		)

		const ids = derived(
			tiles.map(([id, complete]) => derived(complete.formId, (formId) => [id, formId] as const)),
			(values) => Object.fromEntries(values)
		)

		const enhances = Object.fromEntries(
			tiles.map(([id, complete]) => [id, complete.enhance] as const)
		)

		return {
			tiles,
			delayes: delayes,
			ids,
			enhances
		}
	}

	$: ids = data.Tiles.map((tile) => tile.id)

	$: ({
		delayes: completeDelayed,
		ids: completeIds,
		enhances: completeEnhances
	} = deriveForms(ids, { form: data.completeTile, formId: 'complete-' }))

	$: ({
		delayes: deleteDelayed,
		ids: deleteIds,
		enhances: deleteEnhances
	} = deriveForms(ids, { form: data.deleteTile, formId: 'delete-' }))

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

					<div class="card-actions">
						{#if isGameMaster && !isDone}
							{@const enhance = completeEnhances[tile.id]}
							<form action="?/toggle_tile" method="post" use:enhance>
								<input type="hidden" name="__superform_id" bind:value={$completeIds[tile.id]} />

								<button class="btn-primary btn-xs btn cursor-default" type="submit">
									{#if $completeDelayed[tile.id]}
										<span class="loading loading-spinner loading-xs" />
									{/if}
									{!tile.isComplete ? '' : 'in'}complete
								</button>
								<input type="hidden" value={$socketId} name="socketId" />
								<input type="hidden" value={tile.isComplete || ''} name="isComplete" />
								<input type="hidden" value={tile.id} name="id" />
							</form>
						{/if}

						{#if (isGameMaster || data.Viewer.user.id === tile.author.user.id) && !isRunning}
							<label for="delete-tile-{tile.id}" class="btn-error btn-xs btn">delete</label>
						{/if}
					</div>
				</div>
			</div>
		</li>
	{:else}
		<li class="text-error">No tiles yet, create some</li>
	{/each}
</ul>

<div class="grid gap-2">
	{#if data.Tiles.length}
		<div
			class="text-center text-xs {data.Tiles.length < 13
				? 'text-error'
				: data.Tiles.length < 25
				? 'text-warning'
				: 'text-info'}"
		>
			{data.Tiles.length} tiles
		</div>
	{/if}
	{#if !isLocked || (!isRunning && isGameMaster)}
		<form use:createTile.enhance method="post" action="?/create_tile" class="join flex">
			<input type="hidden" name="__superform_id" bind:value={$createId} />

			<TextInput form={createTile} field="content" class="input-primary input join-item flex-1" />
			<input type="hidden" value={$socketId} name="socketId" />
			<button type="submit" class="btn-primary join-item btn cursor-default">
				{#if $createDelayed}
					<span class="loading loading-spinner" />
				{/if}Create
			</button>
		</form>
	{/if}

	{#if !isRunning && isGameMaster}
		<div class="divider">Game master</div>

		{#if !isLocked}
			<form use:lockRoom.enhance method="post" action="?/lock_room">
				<input type="hidden" name="__superform_id" bind:value={$lockId} />
				<input type="hidden" value={$socketId} name="socketId" />
				<button type="submit" class="btn-accent btn w-full cursor-default">
					{#if $lockDelayed}
						<span class="loading loading-spinner" />
					{/if}
					Lock
				</button>
			</form>
		{:else if !isRunning}
			<form use:startRoom.enhance method="post" 			action="?/start_bingo">
				<input type="hidden" name="__superform_id" bind:value={$startId} />
				<input type="hidden" value={$socketId} name="socketId" />
				<button
					type="submit"
					class="btn-primary btn cursor-default w-full"
					disabled={data.Tiles.length < 25}
		
				>
					{#if $startDelayed}
						<span class="loading loading-spinner" />
					{/if}
					{data.Tiles.length < 25 ? '25 tiles required' : 'Start'}
				</button>
			</form>
			<form use:unlockRoom.enhance method="post" action="?/unlock_bingo">
				<input type="hidden" name="__superform_id" bind:value={$unlockId} />
				<input type="hidden" value={$socketId} name="socketId" />
				<button type="submit" class="btn-accent btn cursor-default w-full" >
					{#if $unlockDelayed}
						<span class="loading loading-spinner" />
					{/if}
					Unlock
				</button>
			</form>
		{/if}
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
	{@const enhance = deleteEnhances[tile.id]}
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
				<input type="hidden" name="__superform_id" bind:value={$deleteIds[tile.id]} />

				<input type="hidden" value={tile.id} name="id" />
				<button class="btn-error btn cursor-default" type="submit">
					{#if $deleteDelayed[tile.id]}
						<span class="loading loading-spinner" />
					{/if}delete
				</button>

				<input type="hidden" value={$socketId} name="socketId" />
			</form>
		</div>
		<label class="modal-backdrop" for="delete-tile-{tile.id}">Close</label>
	</div>
{/each}
