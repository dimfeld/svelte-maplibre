<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getId, updatedSourceContext } from './context';
  import type { GeoJSON } from 'geojson';

  export let id: string = getId('geojson');
  export let data: GeoJSON | string;

  const { map, self: source } = updatedSourceContext();
  let sourceObj: maplibregl.GeoJSONSource | undefined;

  let first = true;
  $: if ($map && $source !== id) {
    if ($source) {
      $map.removeSource($source);
    }

    $source = id;
    $map.addSource($source, { type: 'geojson', data });
    sourceObj = $map.getSource($source) as maplibregl.GeoJSONSource | undefined;
    first = true;
  }

  // Don't set the data again after we've just created it.
  $: if (sourceObj) {
    if (first) {
      first = false;
    } else {
      sourceObj.setData(data);
    }
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
