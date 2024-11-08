<script lang="ts">
  import { run } from 'svelte/legacy';

  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import { addSource, removeSource } from './source.js';
  import flush from 'just-flush';
  import type { DEMEncoding, RasterDEMTileSource } from 'maplibre-gl';

  interface Props {
    id?: string;
    tiles: string[];
    tileSize?: number | undefined;
    bounds?: Array<number> | null;
    attribution?: string | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    volatile?: boolean | null;
    encoding?: DEMEncoding | null;
    redFactor?: number | null;
    greenFactor: number | null;
    blueFactor: number | null;
    baseShift: number | null;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('raster-source'),
    tiles,
    tileSize = undefined,
    bounds = null,
    attribution = null,
    minzoom = null,
    maxzoom = null,
    volatile = null,
    encoding = null,
    redFactor = null,
    greenFactor,
    blueFactor,
    baseShift,
    children,
  }: Props = $props();

  const { map, self: source } = updatedSourceContext();
  let sourceObj: RasterDEMTileSource | undefined = $state();

  let first = $state(true);
  run(() => {
    if ($map && $source !== id) {
      $source = id;
      addSource(
        $map,
        $source,
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
        (sourceId: string) => $map && sourceId === $source,
        () => {
          if (!$source) {
            return;
          }

          sourceObj = $map?.getSource($source) as RasterDEMTileSource;
          first = true;
        }
      );

      sourceObj;
    }
  });

  // Don't set tiles again after we've just created it.
  run(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else {
        sourceObj.setTiles(tiles);
      }
    }
  });

  run(() => {
    $map?.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = $map?.getSource(id) as RasterDEMTileSource | undefined;
    });
  });

  onDestroy(() => {
    if ($source && sourceObj && $map) {
      removeSource(map, $source, sourceObj);
      $source = null;
      sourceObj = undefined;
    }
  });
</script>

{#if $source}
  {#key $source}
    {@render children?.()}
  {/key}
{/if}
