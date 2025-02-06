<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import { flush } from '$lib/flush.js';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type RasterTileSource as MaplibreRasterTileSource } from 'maplibre-gl';

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

  const { map } = $derived(getMapContext());
  const { source } = updatedSourceContext();
  let sourceObj: MaplibreRasterTileSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if (map && source.value !== id) {
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

  $effect(() => {
    map.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = map.getSource(id) as MaplibreRasterTileSource | undefined;
    });
  });

  onDestroy(() => {
    if (source.value && sourceObj && map) {
      removeSource(map, source.value, sourceObj);
      source.value = undefined;
      sourceObj = undefined;
    }
  });
</script>

{#if source.value}
  {#key source.value}
    {@render children?.()}
  {/key}
{/if}
