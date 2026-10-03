<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let components: string[] = $derived($page.data.exampleComponents?.[$page.url.pathname] ?? []);
</script>

<div class="mx-auto flex w-11/12 flex-col items-center">
  <h1 class="mb-4">{$page.data.title}</h1>
  {@render children?.()}
  {#if components.length}
    <p class="my-2 text-sm">
      Components used:
      {#each components as name, i (name)}
        <a class="font-mono underline underline-offset-4" href="/docs/components/{name}">{name}</a
        >{i < components.length - 1 ? ', ' : ''}
      {/each}
    </p>
  {/if}
  <p><a href="/">Back to Examples</a></p>
  <p><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p>
</div>
