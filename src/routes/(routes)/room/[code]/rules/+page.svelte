<script lang="ts">
	import CheckBox from '$lib/CheckBox.svelte'
	import { Role } from '$lib/constants'
	import { superForm } from 'sveltekit-superforms/client'

	export let data: import('./$types').PageData

	const form = superForm(data.save, {
		taintedMessage: null
	})
</script>

<main>
	<form action="" use:form.enhance method="post" on:change={(e) => e.currentTarget.submit()}>
		<CheckBox readonly={data.RulesQuery.role !== Role.GAME_MASTER} {form} field="isWithFreeTile" />

		<noscript>
			<div class="form-control mt-6">
				<button type="submit" class="btn-primary btn">save</button>
			</div>
		</noscript>
	</form>
</main>
