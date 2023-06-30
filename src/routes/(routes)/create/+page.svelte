<script lang="ts">
	import TextField from '$lib/TextField.svelte'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	export let data: PageData

	const create = superForm(data.create)
	const { errors: createErrors, formId: createId } = create
</script>

<svelte:head>
	<title>Create room</title>
</svelte:head>


<div class="flex min-h-screen flex-col">
	<main class="flex flex-1 items-center justify-center p-4">
		<div class="card bg-base-200 text-primary-content">
			<div class="card-body">
				<form action="?/create_room" method="post" use:create.enhance>
					<fieldset>
						<legend class="card-title">Create room</legend>
						<label for="" class="label">
							{#each $createErrors._errors ?? [] as error}
								<span class="label-text-alt text-error">{error}</span>
							{/each}
						</label>
						<input type="hidden" name="__superform_id" bind:value={$createId} />
						<TextField form={create} field="name" placeholder={data.namePlaceholder}>
							Name
						</TextField>
						<div class="form-control mt-6">
							<button type="submit" class="btn-primary btn">Create</button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	</main>

	<footer class="flex justify-center p-1">
		<a class="link" href="/">Or join room</a>
	</footer>
</div>
