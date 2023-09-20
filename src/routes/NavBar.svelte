<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { drawerStore } from '@skeletonlabs/skeleton';
  import LogoAndMenu from './LogoAndMenu.svelte';

  export let inDrawer = false;
  let classNames: string = '';
  export { classNames as class };

  const components = [];
  const examples = [
    { href: '/examples/basic', title: `Plain Map` },
    { href: '/examples/custom_marker', title: `Custom Marker` },
    { href: '/examples/draggable_custom_marker', title: `Custom draggable Marker` },
    { href: '/examples/geojson_polygon', title: `GeoJSON Filled Polygon` },
    { href: '/examples/geojson_line_layer', title: `Styled Line` },
    { href: '/examples/heatmap', title: `Heatmap` },
    { href: '/examples/controls', title: `Controls` },
    { href: '/examples/clusters', title: `Clusters and Popups` },
    { href: '/examples/custom_marker_clusters', title: `Custom Markers and Clusters` },
    { href: '/examples/image_symbols', title: `Images in a Symbol Layer` },
    { href: '/examples/marker_layer', title: `Layer Consisting of Markers` },
    { href: '/examples/3d_buildings', title: `3D Buildings` },
    { href: '/examples/geojson_extrusion', title: `GeoJSON Extrusion` },
    { href: '/examples/zoom_transition', title: `Transition Layers with Zoom` },
    { href: '/examples/overlapping_layer_events', title: `Overlapping Layer Events` },
    { href: '/examples/deckgl-arcs', title: `Deck.gl Arc Layers` },
    { href: '/examples/changing_basemap_style', title: `Changing basemap style` },
  ];

  // Examples which don't really warrant showing on the docs site, but ensure that
  // certain functionality works properly.
  const tests = [
    { href: '/tests/map-style-update', title: `Map Style Update` },
    { href: '/tests/marker-class-update', title: `Marker Class Update` },
  ];

  beforeNavigate(() => {
    drawerStore.close();
  });
</script>

<div class="p-4 w-full h-full overflow-y-auto {classNames}">
  <LogoAndMenu menuButton={inDrawer} />

  <h2 class="my-4">Examples</h2>

  <ul>
    {#each examples as { href, title }}
      <li>
        <a
          {href}
          class="w-full rounded-lg btn btn-primary justify-start"
          class:variant-filled={href === $page.url.pathname}>{title}</a
        >
      </li>
    {/each}
  </ul>

  {#if dev}
    <h2 class="my-4">Tests</h2>

    <ul>
      {#each tests as { href, title }}
        <li>
          <a
            {href}
            class="w-full rounded-lg btn btn-primary justify-start"
            class:variant-filled={href === $page.url.pathname}>{title}</a
          >
        </li>
      {/each}
    </ul>
  {/if}

  <p class="mt-4"><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p>
</div>
