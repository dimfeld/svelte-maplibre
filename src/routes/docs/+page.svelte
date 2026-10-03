<script lang="ts">
  let { data } = $props();

  let categories = $derived.by(() => {
    const result = new Map<string, typeof data.components>();
    for (const component of data.components) {
      if (!result.has(component.category)) result.set(component.category, []);
      result.get(component.category)!.push(component);
    }
    return [...result.entries()];
  });
</script>

<svelte:head>
  <title>API Documentation - Svelte MapLibre</title>
</svelte:head>

<div class="doc-page">
  <h1 class="doc-h1">API Documentation</h1>
  <p class="doc-prose">
    Import components, helpers, and types from <code>svelte-maplibre</code>. The pages below are
    generated from the library source code. Each component page shows its props, their types, and
    the examples that use it.
  </p>

  <h2 class="doc-h2 mt-8">Components</h2>
  {#each categories as [category, components] (category)}
    <h3 class="doc-h3">{category}</h3>
    <ul class="grid gap-2 sm:grid-cols-2">
      {#each components as component (component.name)}
        <li>
          <a
            href="/docs/components/{component.name}"
            class="hover:bg-accent block h-full rounded-lg border px-4 py-3"
          >
            <span class="font-mono font-semibold">{component.name}</span>
            {#if component.summary}
              <span class="text-muted-foreground mt-1 block text-sm">{component.summary}</span>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  {/each}

  <h2 class="doc-h2 mt-8">Helpers and Types</h2>
  <ul class="grid gap-2 sm:grid-cols-2">
    {#each data.modules as mod (mod.slug)}
      <li>
        <a
          href="/docs/api/{mod.slug}"
          class="hover:bg-accent block h-full rounded-lg border px-4 py-3"
        >
          <span class="font-semibold">{mod.title}</span>
          <span class="text-muted-foreground mt-1 block text-sm">{@html mod.description}</span>
        </a>
      </li>
    {/each}
  </ul>
</div>
