<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getId, updatedSourceContext } from './';
  import { Protocol } from 'pmtiles';
  import maplibregl from 'maplibre-gl';
  import flush from 'just-flush';

  export let id: string = getId('vector');
  export let url: string | null = null;
  export let tiles: Array<string> | null = null;

  if (url && url.includes('pmtiles://')) {
    if (!maplibregl.config.REGISTERED_PROTOCOLS.hasOwnProperty('pmtiles')) {
      let protocol = new Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
    }
  }

  /** Generate a unique id for each feature. This will overwrite existing IDs. */

  const { map, self: source } = updatedSourceContext();

  $: if ($map && $source !== id) {
    if ($source) {
      $map.removeSource($source);
    }

    $source = id;
    $map.addSource(
      $source,
      flush({
        type: 'vector',
        url,
        tiles,
      })
    );
  }

  onDestroy(() => {
    if ($source) {
      let sourceName = $source;
      $source = null;
      tick().then(() => {
        // Check if the map is still loaded. If the entire map was being torn down
        // then we don't want to call any other functions on it.
        if ($map?.loaded()) {
          $map?.removeSource(sourceName);
        }
      });
    }
  });
</script>

{#if $source}
  {#key $source}
    <slot />
  {/key}
{/if}
