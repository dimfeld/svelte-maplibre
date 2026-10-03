<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import { flush } from '$lib/flush.js';
  import * as pmtiles from 'pmtiles';
  import * as maplibregl from 'maplibre-gl';
  import type { RasterTileSource as MaplibreRasterTileSource } from 'maplibre-gl';

  interface Props {
    id?: string;
    /** An array one or more tile source URLs pointing to the tiles.
     * Either `tiles` or `url` must be provided. */
    tiles?: string[];
    tileSize?: number;
    /** A single URL pointing to a PMTiles archive. Either `tiles` or `url` must be provided. */
    url?: string;
    bounds?: [number, number, number, number];
    scheme?: Scheme;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
    volatile?: boolean;
    children?: Snippet;
  }

  let {
    id = getId('raster-source'),
    tiles = undefined,
    tileSize = undefined,
    url = undefined,
    bounds = undefined,
    scheme = undefined,
    attribution = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    volatile = undefined,
    children,
  }: Props = $props();

  if (url && url.includes('pmtiles://')) {
    if (!Object.hasOwn(maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty, 'pmtiles')) {
      let protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  const { map, loaded } = $derived(getMapContext());
  const { source } = updatedSourceContext();
  let sourceObj: MaplibreRasterTileSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if (map && loaded && source.value !== id) {
      source.value = id;
      addSource(
        map,
        source.value,
        flush({
          type: 'raster',
          tiles,
          tileSize,
          url,
          bounds,
          scheme,
          attribution,
          minzoom,
          maxzoom,
          volatile,
        }),
        (sourceId: string) => map && sourceId === source.value,
        () => {
          if (!source.value) {
            return;
          }

          sourceObj = map.getSource(source.value) as MaplibreRasterTileSource;
          first = true;
        }
      );
    }
  });

  // Don't set tiles/url again after we've just created it.
  $effect(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else if (tiles) {
        sourceObj.setTiles(tiles);
      } else {
        // @ts-expect-error This doesn't seem to actually exist. Leaving it for now until I'm sure I'm not missing something.
        sourceObj.setUrl(url);
      }
    }
  });

  function handleStyleLoad() {
    if (!map) return;

    // When the style changes the current sources are nuked and recreated. Because of this the
    // source object no longer references the current source on the map so we update it here.
    sourceObj = map.getSource(id) as MaplibreRasterTileSource | undefined;
  }

  $effect(() => {
    map?.on('style.load', handleStyleLoad);
  });

  onDestroy(() => {
    if (source.value && sourceObj && map) {
      removeSource(map, source.value, sourceObj);
      source.value = undefined;
      sourceObj = undefined;
    }
  });
</script>

<!-- @component
Add a raster tile source to the map. Give the tiles with `tiles` (an array of tile URLs) or with `url`.

Place a `RasterLayer` inside this component's children and it uses this source automatically. The children render only after the source is added.

If `url` contains `pmtiles://`, the component registers the PMTiles protocol for you. When `tiles` changes, the component updates the tiles of the existing source. Most other props are applied only when the source is created.
-->

{#if source.value}
  {#key source.value}
    {@render children?.()}
  {/key}
{/if}
