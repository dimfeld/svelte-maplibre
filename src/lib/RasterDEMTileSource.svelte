<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import { addSource, removeSource } from './source.js';
  import type { RasterDEMEncoding } from './types.js';
  import flush from 'just-flush';
  import type { RasterDEMTileSource } from 'maplibre-gl';

  export let id: string = getId('raster-source');
  export let tiles: string[];
  export let tileSize: number | undefined = undefined;
  export let bounds: Array<number> | null = null;
  export let attribution: string | null = null;
  export let minzoom: number | null = null;
  export let maxzoom: number | null = null;
  export let volatile: boolean | null = null;
  export let encoding: RasterDEMEncoding | null = null;
  export let redFactor: number | null = null;
  export let greenFactor: number | null;
  export let blueFactor: number | null;
  export let baseShift: number | null;

  const { map, self: source } = updatedSourceContext();
  let sourceObj: RasterDEMTileSource | undefined;

  let first = true;
  $: if ($map && $source !== id) {
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

  // Don't set tiles again after we've just created it.
  $: if (sourceObj) {
    if (first) {
      first = false;
    } else {
      sourceObj.setTiles(tiles);
    }
  }

  $: $map?.on('style.load', () => {
    // When the style changes the current sources are nuked and recreated. Because of this the
    // source object no longer references the current source on the map so we update it here.
    sourceObj = $map?.getSource(id) as RasterDEMTileSource | undefined;
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
    <slot />
  {/key}
{/if}
