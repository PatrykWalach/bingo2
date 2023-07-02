<script>
	import { page } from '$app/stores'
</script>

<main class="flex min-h-screen items-center justify-center bg-error text-error-content">
	<div class="card">
		<div class="card-body items-center">
			<h1 class="card-title inline font-black text-9xl">{$page.status}</h1>
			<p>{$page.error?.message}</p>
      <div class="card-actions">
        <a href="/" class="btn lg:btn-lg btn-neutral">go home</a>
        <a href="/" class="btn lg:btn-lg btn-ghost">contact us</a>
      </div>
		</div>
	</div>
</main>
