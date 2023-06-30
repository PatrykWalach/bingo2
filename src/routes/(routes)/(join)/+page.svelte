<script lang="ts">
	import TextField from '$lib/TextField.svelte'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	export let data: PageData

	const join = superForm(data.form, {})
	const { errors: joinErrors, formId: joinId } = join
</script>


<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main class="flex flex-1 items-center justify-center p-4">
		<div class="card bg-base-200 text-secondary-content">
			<div class="card-body">
				<form action="?/join_room" method="post" use:join.enhance>
					<fieldset>
						<legend class="card-title">Join room</legend>

						<label for="" class="label">
							{#each $joinErrors._errors ?? [] as error}
								<span class="label-text-alt text-error">{error}</span>
							{/each}
						</label>
						<input type="hidden" name="__superform_id" bind:value={$joinId} />
						<TextField form={join} field="code">Code</TextField>
						<div class="form-control mt-6">
							<button type="submit" class="btn-primary btn">Join</button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	</main>

	<footer class="flex justify-center p-1">
		<a class="link" href="/create">Or create room</a>
	</footer>
</div>
