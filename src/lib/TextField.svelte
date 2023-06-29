<script lang="ts">
	import TextInput from './TextInput.svelte'

	import type { FormPathLeaves, ZodValidation } from 'sveltekit-superforms'
	import type { SuperForm } from 'sveltekit-superforms/client'
	import { formFieldProxy } from 'sveltekit-superforms/client'
	import type { AnyZodObject, z } from 'zod'

	/* eslint-disable-next-line @typescript-eslint/no-unused-vars, no-undef */
	type T = $$Generic<AnyZodObject>

	export let form: SuperForm<ZodValidation<T>, unknown>
	export let field: FormPathLeaves<z.infer<T>>
	export let id = String(field)

	$: inputId = id ?? String(field)

	const { errors, constraints } = formFieldProxy(form, field)
</script>

<div class="form-control">
	<label class="label" for={inputId}>
		<span class="label-text"><slot /></span>
	</label>
	<TextInput {form} {field} {id} {...$constraints} {...$$restProps} />
	<label class="label" for={inputId}>
		<span class="label-text-alt text-error">
			{$errors || ''}
		</span>
	</label>
</div>
