<script lang="ts">
  import { page } from '$app/stores';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="mx-auto flex w-11/12 flex-col items-center">
  <h1 class="mb-4">{$page.data.title}</h1>
  {@render children?.()}
  <p><a href="/">Back to Examples</a></p>
  <p><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p>
</div>
