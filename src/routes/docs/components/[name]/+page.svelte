<script lang="ts">
  import CodeBlock from '$site/components/CodeBlock.svelte';
  import ExampleLinks from '$site/api-docs/ExampleLinks.svelte';
  import PropsSection from '$site/api-docs/PropsSection.svelte';

  let { data } = $props();
  let component = $derived(data.component);
</script>

<svelte:head>
  <title>{component.name} - Svelte MapLibre</title>
  {#if component.summary}
    <meta name="description" content={component.summary} />
  {/if}
</svelte:head>

<article class="doc-page">
  <p class="text-muted-foreground text-sm">
    <a href="/docs" class="hover:underline">API</a> / {component.category}
  </p>
  <h1 class="doc-h1 font-mono">{component.name}</h1>

  {#if component.description}
    <div class="doc-prose">{@html component.description}</div>
  {/if}

  <CodeBlock
    class="my-4"
    language="javascript"
    code={`import { ${component.name} } from 'svelte-maplibre';`}
  />

  {#if component.generics}
    <p class="text-sm">
      Generic parameters: <code class="doc-type">{component.generics}</code>
    </p>
  {/if}

  <ExampleLinks examples={component.examples} />

  <PropsSection members={component.props} />

  <p class="text-muted-foreground mt-8 text-sm">
    Source:
    <a
      class="underline underline-offset-4"
      href="https://github.com/dimfeld/svelte-maplibre/blob/master/src/lib/{component.file}"
    >
      src/lib/{component.file}
    </a>
  </p>
</article>
