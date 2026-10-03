<script lang="ts">
  import type { ExampleRef } from './types.js';

  interface Props {
    examples: ExampleRef[];
    title?: string;
  }

  let { examples, title = 'Examples' }: Props = $props();
</script>

{#if examples.length}
  <section class="my-6">
    <h2 class="doc-h2">{title}</h2>
    <ul class="flex flex-wrap gap-2">
      {#each examples as example (example.href)}
        <li>
          <a
            href={example.href}
            class="bg-secondary hover:bg-accent inline-block rounded-md border px-3 py-1 text-sm"
          >
            {example.title}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}
