<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { getId, updatedSourceContext } from './context.js';
  import { addSource, removeSource } from './source.js';
  import type { ImageSource, Coordinates } from 'maplibre-gl';
  import flush from 'just-flush';

  interface Props {
    id?: string;
    url: string;
    coordinates: Coordinates;
    children?: import('svelte').Snippet;
  }

  let { id = getId('image'), url, coordinates, children }: Props = $props();

  const { map, self: source } = updatedSourceContext();
  let sourceObj: ImageSource | undefined = $state();

  let first = $state(true);
  $effect(() => {
    if ($map && $source !== id) {
      $source = id;
      addSource(
        $map,
        $source,
        flush({
          type: 'image',
          url,
          coordinates,
        }),
        (sourceId) => $map && sourceId === $source,
        () => {
          if (!$source) {
            return;
          }
          sourceObj = $map?.getSource($source) as ImageSource;
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
    $map?.on('style.load', () => {
      // When the style changes the current sources are nuked and recreated. Because of this the
      // source object no longer references the current source on the map so we update it here.
      sourceObj = $map?.getSource(id) as ImageSource | undefined;
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
