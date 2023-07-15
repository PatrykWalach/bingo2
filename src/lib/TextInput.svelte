<script lang="ts">
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

	const { value, errors, constraints } = formFieldProxy(form, field)
</script>

<input
	bind:value={$value}
	class="input input-bordered"
	type="text"
	aria-invalid={$errors ? 'true' : undefined}
	name={field}
	id={inputId}
	{...$constraints}
	{...$$restProps}
/>
