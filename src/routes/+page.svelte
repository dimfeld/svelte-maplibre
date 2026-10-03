<script lang="ts">
  import CodeBlock from '$site/components/CodeBlock.svelte';

  const setupCode = `<script module>
  import * as maplibregl from 'maplibre-gl';
  import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
  maplibregl.setWorkerUrl(maplibreWorkerUrl);
<\/script>

<script>
  import { MapLibre } from 'svelte-maplibre';
<\/script>

<MapLibre
  center={[50, 20]}
  zoom={7}
  class="map"
  standardControls
  style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
/>

<style>
  :global(.map) {
    height: 500px;
  }
</style>`;
</script>

<svelte:head>
  <title>Svelte MapLibre</title>
</svelte:head>

<div class="doc-page">
  <h1 class="doc-h1">Svelte MapLibre</h1>

  <div class="doc-prose">
    <p>
      Svelte MapLibre is a library offering idiomatic Svelte support for the
      <a href="https://maplibre.org/projects/maplibre-gl-js/">MapLibre GL</a> mapping library.
    </p>
    <p>
      Read the <a href="/docs">API documentation</a> for a list of all components, their props, and the
      helper functions and types. Each example in the menu shows its code, and each component page links
      to the examples that use it.
    </p>
  </div>

  <h2 class="doc-h2">Installation</h2>
  <CodeBlock language="bash" code="npm install svelte-maplibre" />

  <h2 class="doc-h2">Usage</h2>
  <div class="doc-prose">
    <p>
      If you use Vite, import the MapLibre worker URL and set it before you create the first map.
      The
      <code>?worker&amp;url</code> import tells Vite to emit the worker as an asset.
    </p>
  </div>
  <CodeBlock class="my-4" code={setupCode} />
</div>
