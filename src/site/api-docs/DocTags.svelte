<script lang="ts">
  import type { DocTag } from './types.js';

  interface Props {
    tags: DocTag[];
  }

  let { tags }: Props = $props();

  // Show `@param` tags as a parameter list, and every other tag by its name.
  let params = $derived(
    tags
      .filter((t) => t.name === 'param')
      .map((t) => {
        const match = /^(\S+)\s*(?:-\s*)?([\s\S]*)$/.exec(t.text);
        return { name: match?.[1] ?? t.text, text: match?.[2] ?? '' };
      })
  );
  let others = $derived(tags.filter((t) => t.name !== 'param'));
</script>

{#if params.length}
  <div class="my-2">
    <h4 class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Parameters</h4>
    <ul class="mt-1 list-none space-y-1 text-sm">
      {#each params as param (param.name)}
        <li><code>{param.name}</code> {param.text ? `— ${param.text}` : ''}</li>
      {/each}
    </ul>
  </div>
{/if}

{#each others as tag, i (i)}
  <p class="my-1 text-sm" class:text-destructive={tag.name === 'deprecated'}>
    <span class="font-semibold">@{tag.name}</span>
    {tag.text}
  </p>
{/each}
