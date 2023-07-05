<script lang="ts">
  import type { Writable } from 'svelte/store'
  import type { FormPathLeaves, ZodValidation } from 'sveltekit-superforms'
  import { formFieldProxy, type SuperForm } from 'sveltekit-superforms/client'
  import type { z } from 'zod'

  type T = $$Generic<AnyZodObject>;

  export let form: SuperForm<ZodValidation<T>, unknown>;
  export let field: FormPathLeaves<z.infer<T>>;
  const { value, errors, constraints } = formFieldProxy(form, field);

  $: boolValue = value as Writable<boolean>;
</script>


 
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Free tile</span>
    <input

      name={field}
      type="checkbox"
      class="checkbox"
      bind:checked={$boolValue}
      {...$constraints}
      {...$$restProps}
    />
  </label>
</div>