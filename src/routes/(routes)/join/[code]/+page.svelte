<script lang="ts">
	import TextField from '$lib/TextField.svelte'
	import { socketId } from '$lib/socket'
	import { superForm } from 'sveltekit-superforms/client'
	import type { PageData } from './$types'

	export let data: PageData

	const join = superForm(data.form, {})
	const { errors: joinErrors, formId: joinId, form, delayed } = join
</script>

<svelte:head>
	<title>Join room</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<main class="flex flex-1 items-center justify-center p-4">
		<div class="card bg-base-200 text-base-content">
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
						<input type="hidden" value={$socketId} name="socketId" />

						<fieldset class="form-control">
							<legend class="label"><span class="label-text">Avatar</span></legend>

							<ul class="flex flex-wrap gap-1">
								{#each data.avatars as avatar}
									<li>
										<label class="btn btn-circle btn-active" data-testid="avatar-label">
											<div class="avatar m-2">
												<input
													type="radio"
													name="avatar"
													value={avatar.url}
													checked={$form.avatar === avatar.url}
													class="peer hidden"
												/>
												<div
													class="w-12 rounded-full ring-[--color] ring-offset-2 ring-offset-base-100 peer-checked:ring"
													style="--color: {$form.color}"
												>
													<img src={avatar.url} alt={avatar.alt} />
													<div class="sr-only">{avatar.alt}</div>
												</div>
											</div>
										</label>
									</li>
								{/each}
							</ul>
						</fieldset>

						<TextField form={join} field="color" type="color" class="">Color</TextField>
						<TextField form={join} field="name">Name</TextField>

						<div class="form-control mt-6">
							<button type="submit" class="btn btn-primary cursor-default">
								{#if $delayed}
									<span class="loading loading-spinner" />
								{/if}Join
							</button>
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
