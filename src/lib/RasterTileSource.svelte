<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import flush from 'just-flush';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type RasterTileSource } from 'maplibre-gl';

  interface Props {
    id?: string;
    /** An array one or more tile source URLs pointing to the tiles.
     * Either `tiles` or `url` must be provided. */
    tiles?: string[] | undefined;
    tileSize?: number | undefined;
    /** A single URL pointing to a PMTiles archive. Either `tiles` or `url` must be provided. */
    url?: string | undefined;
    bounds?: Array<number> | null;
    scheme?: Scheme | null;
    attribution?: string | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    volatile?: boolean | null;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('raster-source'),
    tiles = undefined,
    tileSize = undefined,
    url = undefined,
    bounds = null,
    scheme = null,
    attribution = null,
    minzoom = null,
    maxzoom = null,
    volatile = null,
    children,
  }: Props = $props();

  if (url && url.includes('pmtiles://')) {
    if (!maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty('pmtiles')) {
      let protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  const { map, self: source } = updatedSourceContext();
  let sourceObj: RasterTileSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if ($map && $source !== id) {
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
  });

  // Don't set tiles/url again after we've just created it.
  $effect(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else if (tiles) {
        sourceObj.setTiles(tiles);
      } else {
        sourceObj.setUrl(url);
      }
    }
  });

  $effect(() => {
    $map?.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = $map?.getSource(id) as RasterTileSource | undefined;
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
