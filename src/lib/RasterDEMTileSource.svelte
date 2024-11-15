<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
  import { addSource, removeSource } from './source.js';
  import { flush } from '$lib/flush.js';
  import type { DEMEncoding, RasterDEMTileSource } from 'maplibre-gl';

  interface Props {
    id?: string;
    tiles: string[];
    tileSize?: number | undefined;
    bounds?: [number, number, number, number];
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
    volatile?: boolean;
    encoding?: DEMEncoding;
    redFactor?: number;
    greenFactor?: number;
    blueFactor?: number;
    baseShift?: number;
    children?: Snippet;
  }

  let {
    id = getId('raster-source'),
    tiles,
    tileSize = undefined,
    bounds = undefined,
    attribution = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    volatile = undefined,
    encoding = undefined,
    redFactor = undefined,
    greenFactor = undefined,
    blueFactor = undefined,
    baseShift = undefined,
    children,
  }: Props = $props();

  const { map } = getMapContext();
  const { source } = updatedSourceContext();
  let sourceObj: RasterDEMTileSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if (map && source.value !== id) {
      source.value = id;
      addSource(
        map,
        source.value,
        flush({
          type: 'raster-dem',
          tiles,
          tileSize,
          bounds,
          attribution,
          minzoom,
          maxzoom,
          volatile,
          encoding,
          redFactor,
          greenFactor,
          blueFactor,
          baseShift,
        }),
        (sourceId: string) => map && sourceId === source.value,
        () => {
          if (!source.value) {
            return;
          }

          sourceObj = map.getSource(source.value) as RasterDEMTileSource;
          first = true;
        }
      );

      sourceObj;
    }
  });

  // Don't set tiles again after we've just created it.
  $effect(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else {
        sourceObj.setTiles(tiles);
      }
    }
  });

  $effect(() => {
    map.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = map.getSource(id) as RasterDEMTileSource | undefined;
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
