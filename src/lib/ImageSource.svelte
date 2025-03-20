<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import { getId, getMapContext, updatedSourceContext } from './context.svelte.js';
  import { addSource, removeSource } from './source.js';
  import type { ImageSource as MaplibreImageSource, Coordinates } from 'maplibre-gl';
  import { flush } from '$lib/flush.js';

  interface Props {
    id?: string;
    url: string;
    coordinates: Coordinates;
    children?: Snippet;
  }

  let { id = getId('image'), url, coordinates, children }: Props = $props();

  const { map, loaded } = $derived(getMapContext());
  const { source } = updatedSourceContext();
  let sourceObj: MaplibreImageSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if (map && loaded && source.value !== id) {
      source.value = id;
      addSource(
        map,
        source.value,
        flush({
          type: 'image',
          url,
          coordinates,
        }),
        (sourceId) => map && sourceId === source.value,
        () => {
          if (!source.value) {
            return;
          }
          sourceObj = map.getSource(source.value) as MaplibreImageSource;
          first = true;
        }
      );
    }
  });

  // Don't set coordinates again after we've just created it.
  $effect(() => {
    if (sourceObj) {
      if (first) {
        first = false;
      } else {
        sourceObj.setCoordinates(coordinates);
      }
    }
  });

  $effect(() => {
    map.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = map.getSource(id) as MaplibreImageSource | undefined;
    });
  });

  onDestroy(() => {
    if (source.value) {
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
