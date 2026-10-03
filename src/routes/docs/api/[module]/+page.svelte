<script lang="ts">
  import CodeBlock from '$site/components/CodeBlock.svelte';
  import DocTags from '$site/api-docs/DocTags.svelte';
  import ExampleLinks from '$site/api-docs/ExampleLinks.svelte';
  import PropsSection from '$site/api-docs/PropsSection.svelte';
  import type { ApiItem } from '$site/api-docs/types.js';

  let { data } = $props();
  let mod = $derived(data.module);

  const kindTitles: Record<ApiItem['kind'], string> = {
    function: 'Functions',
    class: 'Classes',
    interface: 'Interfaces',
    type: 'Types',
    variable: 'Variables',
  };

  let groups = $derived.by(() => {
    const own = mod.items.filter((item) => !item.reexportedFrom);
    const result = (Object.keys(kindTitles) as ApiItem['kind'][])
      .map((kind) => ({
        title: kindTitles[kind],
        items: own.filter((item) => item.kind === kind),
      }))
      .filter((group) => group.items.length);

    const reexported = mod.items.filter((item) => item.reexportedFrom);
    return { groups: result, reexported };
  });
</script>

<svelte:head>
  <title>{mod.title} - Svelte MapLibre</title>
</svelte:head>

<article class="doc-page">
  <p class="text-muted-foreground text-sm">
    <a href="/docs" class="hover:underline">API</a> / {mod.file}
  </p>
  <h1 class="doc-h1">{mod.title}</h1>
  <div class="doc-prose">{@html mod.description}</div>

  <nav class="my-6 rounded-lg border p-4" aria-label="On this page">
    {#each groups.groups as group (group.title)}
      <h2
        class="text-muted-foreground mt-2 text-xs font-semibold tracking-wide uppercase first:mt-0"
      >
        {group.title}
      </h2>
      <ul class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {#each group.items as item (item.name)}
          <li><a href="#{item.name}" class="font-mono text-sm hover:underline">{item.name}</a></li>
        {/each}
      </ul>
    {/each}
    {#if groups.reexported.length}
      <h2 class="text-muted-foreground mt-2 text-xs font-semibold tracking-wide uppercase">
        Re-exported
      </h2>
      <ul class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {#each groups.reexported as item (item.name)}
          <li><a href="#{item.name}" class="font-mono text-sm hover:underline">{item.name}</a></li>
        {/each}
      </ul>
    {/if}
  </nav>

  {#each groups.groups as group (group.title)}
    <h2 class="doc-h2 mt-10">{group.title}</h2>
    {#each group.items as item (item.name)}
      <section id={item.name} class="my-8 scroll-mt-4">
        <h3 class="flex flex-wrap items-baseline gap-2 text-lg font-semibold">
          <a href="#{item.name}" class="font-mono hover:underline">{item.name}</a>
          <span class="doc-badge">{item.kind}</span>
        </h3>
        <p class="text-muted-foreground mt-1 text-sm">
          <code
            >import {item.kind === 'interface' || item.kind === 'type' ? 'type ' : ''}{'{'}
            {item.name}
            {'}'} from '{item.importFrom}';</code
          >
        </p>

        {#if item.description}
          <div class="doc-prose mt-2">{@html item.description}</div>
        {/if}

        {#if item.kind === 'interface' && item.members?.length}
          <PropsSection title="Members" members={item.members} anchorPrefix="{item.name}." />
          <details class="my-2">
            <summary class="text-muted-foreground cursor-pointer text-sm">Declaration</summary>
            <CodeBlock class="mt-2" language="typescript" code={item.signature} />
          </details>
        {:else}
          <CodeBlock class="my-3" language="typescript" code={item.signature} />
        {/if}

        <DocTags tags={item.tags} />
        <ExampleLinks examples={item.examples} title="Used in Examples" />
      </section>
    {/each}
  {/each}

  {#if groups.reexported.length}
    <h2 class="doc-h2 mt-10">Re-exported Types</h2>
    <p class="doc-prose">
      These types come from other packages. This library re-exports them for convenience.
    </p>
    <ul class="divide-y rounded-lg border">
      {#each groups.reexported as item (item.name)}
        <li id={item.name} class="scroll-mt-4 px-4 py-3">
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="font-mono font-semibold">{item.name}</span>
            <span class="text-muted-foreground text-sm"
              >from <code>{item.reexportedFrom}</code></span
            >
          </div>
          {#if item.summary}
            <p class="text-muted-foreground mt-1 text-sm">{item.summary}</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</article>
