<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { getDrawerStore } from '@skeletonlabs/skeleton';
  import LogoAndMenu from './LogoAndMenu.svelte';

  interface Props {
    inDrawer?: boolean;
    class?: string;
  }

  let { inDrawer = false, class: classNames = '' }: Props = $props();

  const drawerStore = getDrawerStore();

  const components = [];
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
    { href: '/examples/flatgeobuf', title: `FlatGeobuf With Styling` },
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
    drawerStore.close();
  });
</script>

<div class="h-full w-full overflow-y-auto p-4 {classNames}">
  <LogoAndMenu menuButton={inDrawer} />

  <h2 class="my-4">Examples</h2>

  <ul>
    {#each examples as { href, title }}
      <li>
        <a
          {href}
          class="btn-primary btn w-full justify-start rounded-lg"
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
            class="btn-primary btn w-full justify-start rounded-lg"
            class:variant-filled={href === $page.url.pathname}>{title}</a
          >
        </li>
      {/each}
    </ul>
  {/if}

  <p class="mt-4"><a href="https://github.com/dimfeld/svelte-maplibre">Github</a></p>
</div>
