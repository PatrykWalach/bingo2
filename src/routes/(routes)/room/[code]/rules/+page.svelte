<script lang="ts">
	import CheckBox from '$lib/CheckBox.svelte'
	import { Role, State } from '$lib/constants'
	import { superForm } from 'sveltekit-superforms/client'

	export let data: import('./$types').PageData

	const save = superForm(data.save, {
		taintedMessage: null
	})
	const { form, errors, constraints ,delayed} = save

	$: isDone = data.RulesQuery.room.state === State.DONE
	$: isRunning = isDone || data.RulesQuery.room.state === State.RUNNING
</script>

<main>
	<form action="" use:save.enhance method="post" on:change={(e) => e.currentTarget.submit()}>
		<CheckBox
			disabled={isRunning || data.RulesQuery.role !== Role.GAME_MASTER}
			form={save}
			field="isWithFreeTile"
		>
			Free tile
		</CheckBox>

		<CheckBox
			disabled={isRunning || data.RulesQuery.role !== Role.GAME_MASTER}
			form={save}
			field="isWithHiddenBoards"
		>
			Hide boards
		</CheckBox>

		<div class="form-control">
			<label class="label flex cursor-pointer">
				<span class="label-text flex-1">Win condition</span>
				<select
					class="select"
					disabled={isRunning}
					name="winCondition"
					id="winCondition"
					aria-invalid={$errors.winCondition ? 'true' : undefined}
					{...$constraints.winCondition}
				>
					<option value="FIRST_ROW" selected={$form.winCondition === 'FIRST_ROW'}>First Row</option>
					<option value="ALL_ROWS" selected={$form.winCondition === 'ALL_ROWS'}>All rows</option>
				</select>
			</label>
			<label class="label" for="winCondition">
				<span class="label-text-alt text-error">
					{$errors.winCondition || ''}
				</span>
			</label>
		</div>

		<noscript>
			<div class="form-control mt-6">
				<button type="submit" class="btn-primary btn">						{#if $delayed}
					<span class="loading loading-spinner"></span>

				{/if }save</button>
			</div>
		</noscript>
	</form>
</main>
