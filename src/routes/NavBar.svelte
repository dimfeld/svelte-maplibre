<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { Button } from '$site/components/ui/button';
  import LogoAndMenu from './LogoAndMenu.svelte';

  interface Props {
    class?: string;
    /** Called after a navigation starts, used to close the mobile drawer. */
    close?: () => void;
  }

  let { class: className = '', close }: Props = $props();

  const examples = [
    { href: '/examples/basic', title: `Plain Map` },
    { href: '/examples/marker', title: `Default Markers` },
    { href: '/examples/custom_marker', title: `Custom Markers` },
    { href: '/examples/marker_on_click', title: `Add Marker On Click` },
    { href: '/examples/draggable_custom_marker', title: `Custom draggable Markers` },
    { href: '/examples/popup_remote', title: `Remote Popup Data` },
    { href: '/examples/geojson_polygon', title: `GeoJSON Filled Polygon` },
    { href: '/examples/geojson_line_layer', title: `Styled Line` },
    { href: '/examples/heatmap', title: `Heatmap` },
    { href: '/examples/controls', title: `Controls` },
    { href: '/examples/clusters', title: `Clusters and Popups` },
    { href: '/examples/custom_marker_clusters', title: `Custom Markers and Clusters` },
    { href: '/examples/image_symbols', title: `Images in a Symbol Layer` },
    { href: '/examples/marker_layer', title: `Layer Consisting of Markers` },
    { href: '/examples/draw', title: `Drawing` },
    { href: '/examples/3d_buildings', title: `3D Buildings` },
    { href: '/examples/geojson_extrusion', title: `GeoJSON Extrusion` },
    { href: '/examples/zoom_transition', title: `Transition Layers with Zoom` },
    { href: '/examples/overlapping_layer_events', title: `Overlapping Layer Events` },
    { href: '/examples/deckgl-arcs', title: `Deck.gl Arc Layers` },
    { href: '/examples/changing_basemap_style', title: `Changing basemap style` },
    { href: '/examples/vector_source', title: `Vector Tile Source` },
    { href: '/examples/pmtile_source', title: `PMTiles Source` },
    { href: '/examples/data_join', title: `Client Side Data Join` },
    { href: '/examples/raster_source', title: `Raster Source` },
    { href: '/examples/image_source', title: `Image Source` },
    { href: '/examples/cooperative_gestures', title: `Cooperative Gestures` },
    { href: '/examples/globe', title: `Globe` },
    { href: '/examples/background', title: `Background Layer` },
    { href: '/examples/3d_terrain', title: `3D Terrain` },
  ];

  // Examples which don't really warrant showing on the docs site, but ensure that
  // certain functionality works properly.
  const tests = [
    { href: '/tests/map-style-update', title: `Map Style Update` },
    { href: '/tests/marker-class-update', title: `Marker Class Update` },
    { href: '/tests/marker-z-index', title: `Marker Z-Index` },
    { href: '/tests/replace_source', title: `Replace a Source` },
    { href: '/tests/change_center_zoom', title: `Change Center and Zoom` },
    { href: '/tests/standalone-popup', title: `Standalone Popup` },
  ];

  beforeNavigate(() => {
    close?.();
  });
</script>

<nav class="flex h-full w-full flex-col gap-4 overflow-y-auto p-4 {className}">
  <LogoAndMenu />

  <div>
    <h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
      Examples
    </h2>
    <ul class="flex flex-col gap-0.5">
      {#each examples as { href, title } (href)}
        <li>
          <Button
            {href}
            variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
            class="w-full justify-start font-normal"
          >
            {title}
          </Button>
        </li>
      {/each}
    </ul>
  </div>

  {#if dev}
    <div>
      <h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
        Tests
      </h2>
      <ul class="flex flex-col gap-0.5">
        {#each tests as { href, title } (href)}
          <li>
            <Button
              {href}
              variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
              class="w-full justify-start font-normal"
            >
              {title}
            </Button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <p class="mt-2 px-2 text-sm">
    <a
      class="hover:text-primary underline underline-offset-4"
      href="https://github.com/dimfeld/svelte-maplibre"
    >
      Github
    </a>
  </p>
</nav>
