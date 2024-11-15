<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, mapContext, updatedSourceContext } from './context.svelte.js';
  import { addSource, removeSource } from './source.js';
  import type { Scheme } from './types.js';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type VectorTileSource } from 'maplibre-gl';
  import { flush } from '$lib/flush.js';

  interface Props {
    id?: string;
    url?: string;
    tiles?: string[];
    promoteId?: string;
    bounds?: [number, number, number, number];
    scheme?: Scheme;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
    volatile?: boolean;
    children?: Snippet;
  }

  let {
    id = getId('vector'),
    url = undefined,
    tiles = undefined,
    promoteId = undefined,
    bounds = undefined,
    scheme = undefined,
    attribution = undefined,
    minzoom = undefined,
    maxzoom = undefined,
    volatile = undefined,
    children,
  }: Props = $props();

  if (url && url.includes('pmtiles://')) {
    if (!Object.hasOwn(maplibregl.config.REGISTERED_PROTOCOLS, 'pmtiles')) {
      let protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  const { map } = mapContext();
  const { source } = updatedSourceContext();

  let sourceObj: VectorTileSource | undefined = $state();

  $effect(() => {
    if (source.value !== id) {
      source.value = id;
      addSource(
        map,
        source.value,
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
        (sourceId) => map && sourceId === source.value,
        () => {
          if (!source.value) {
            return;
          }
          sourceObj = map.getSource(source.value) as VectorTileSource;
        }
      );
    }
  });

  $effect(() => {
    map.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = map.getSource(id) as VectorTileSource | undefined;
    });
  });

  onDestroy(() => {
    if (source.value && map) {
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
