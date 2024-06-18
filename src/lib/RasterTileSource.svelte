<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import flush from 'just-flush';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type RasterTileSource } from 'maplibre-gl';

  export let id: string = getId('raster-source');
  export let tiles: string[] | null = null;
  export let tileSize: number | undefined = undefined;
  export let url: string;
  export let bounds: Array<number> | null = null;
  export let scheme: Scheme | null = null;
  export let attribution: string | null = null;
  export let minzoom: number | null = null;
  export let maxzoom: number | null = null;
  export let volatile: boolean | null = null;

  if (url && url.includes('pmtiles://')) {
    if (!maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty('pmtiles')) {
      let protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  const { map, self: source } = updatedSourceContext();
  let sourceObj: RasterTileSource | undefined;

  let first = true;
  $: if ($map && $source !== id) {
    $source = id;
    addSource(
      $map,
      $source,
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
      (sourceId: string) => $map && sourceId === $source,
      () => {
        if (!$source) {
          return;
        }

        sourceObj = $map?.getSource($source) as RasterTileSource;
        first = true;
      }
    );

    sourceObj;
  }

  // Don't set tiles/url again after we've just created it.
  $: if (sourceObj) {
    if (first) {
      first = false;
    } else if (tiles) {
      sourceObj.setTiles(tiles);
    } else {
      sourceObj.setUrl(url);
    }
  }

  $: $map?.on('style.load', () => {
    // When the style changes the current sources are nuked and recreated. Because of this the
    // source object no longer references the current source on the map so we update it here.
    sourceObj = $map?.getSource(id) as RasterTileSource | undefined;
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
