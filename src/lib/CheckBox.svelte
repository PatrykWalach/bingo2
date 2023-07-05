<script lang="ts">
	import type { Writable } from 'svelte/store'
	import type { FormPathLeaves, ZodValidation } from 'sveltekit-superforms'
	import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client'
	import type { AnyZodObject, z } from 'zod'

	/* eslint-disable-next-line @typescript-eslint/no-unused-vars, no-undef */
	type T = $$Generic<AnyZodObject>

	export let form: SuperForm<ZodValidation<T>, unknown>
	export let field: FormPathLeaves<z.infer<T>>
	export let id = String(field)

	$: inputId = id ?? String(field)
	const { value, errors, constraints } = formFieldProxy(form, field)

	$: boolValue = value as Writable<boolean>
</script>

<div class="form-control">
	<label class="label cursor-pointer">
		<span class="label-text"><slot /></span>
		<input
			id={inputId}
			name={field}
			type="checkbox"
			class="checkbox"
			bind:checked={$boolValue}
			{...$constraints}
			{...$$restProps}
		/>
	</label>
	<label class="label" for={inputId}>
		<span class="label-text-alt text-error">
			{$errors || ''}
		</span>
	</label>
</div>
