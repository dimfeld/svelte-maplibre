<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getId, updatedSourceContext } from './context.js';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type VectorTileSource } from 'maplibre-gl';
  import flush from 'just-flush';

  interface Props {
    id?: string;
    url?: string | null;
    tiles?: Array<string> | null;
    promoteId?: string | null;
    bounds?: Array<number> | null;
    scheme?: Scheme | null;
    attribution?: string | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    volatile?: boolean | null;
    children?: import('svelte').Snippet;
  }

  let {
    id = getId('vector'),
    url = null,
    tiles = null,
    promoteId = null,
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
  let sourceObj: VectorTileSource | undefined = $state();

  $effect(() => {
    if ($map && $source !== id) {
      $source = id;
      addSource(
        $map,
        $source,
        flush({
          type: 'vector',
          url,
          tiles,
          promoteId,
          bounds,
          scheme,
          attribution,
          minzoom,
          maxzoom,
          volatile,
        }),
        (sourceId) => $map && sourceId === $source,
        () => {
          if (!$source) {
            return;
          }
          sourceObj = $map?.getSource($source) as VectorTileSource;
        }
      );
    }
  });

  $effect(() => {
    $map?.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = $map?.getSource(id) as VectorTileSource | undefined;
    });
  });

  onDestroy(() => {
    if ($source && $map) {
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
