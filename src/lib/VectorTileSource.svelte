<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getId, updatedSourceContext } from './context.js';
  import { addSource, removeSource } from './source.js';
  import * as pmtiles from 'pmtiles';
  import maplibregl, { type VectorTileSource } from 'maplibre-gl';
  import flush from 'just-flush';

  export let id: string = getId('vector');
  export let url: string | null = null;
  export let tiles: Array<string> | null = null;
  export let promoteId: string | null = null;
  export let minzoom: number | null = null;
  export let maxzoom: number | null = null;

  if (url && url.includes('pmtiles://')) {
    if (!maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty('pmtiles')) {
      let protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  const { map, self: source } = updatedSourceContext();
  let sourceObj: VectorTileSource | undefined;

  $: if ($map && $source !== id) {
    $source = id;
    addSource(
      $map,
      $source,
      flush({
        type: 'vector',
        url,
        tiles,
        promoteId,
        minzoom,
        maxzoom,
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

  $: $map?.on('style.load', () => {
    // When the style changes the current sources are nuked and recreated. Because of this the
    // source object no longer references the current source on the map so we update it here.
    sourceObj = $map?.getSource(id) as VectorTileSource | undefined;
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
    <slot />
  {/key}
{/if}
