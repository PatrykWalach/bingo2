<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<div>
	<ol class="grid grid-cols-5 grid-rows-5 gap-2">
		{#each data.BoardQuery as tile (tile.id)}
			<li
				class="flex aspect-square flex-1 items-center justify-center truncate rounded bg-base-200 p-2 {tile
					.tile.isComplete
					? 'bg-primary text-primary-content'
					: ''}"
			>
				{tile.tile.content}
			</li>
		{/each}
	</ol>
</div>
