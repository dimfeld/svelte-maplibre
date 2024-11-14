<script lang="ts">
  import type maplibregl from 'maplibre-gl';
  import { onDestroy } from 'svelte';
  import { mapContext } from './context.svelte.js';

  interface Props {
    defaultStyling?: boolean;
    position?: maplibregl.ControlPosition;
    class?: string | undefined;
    children?: import('svelte').Snippet;
  }

  let {
    defaultStyling = true,
    position = 'top-right',
    class: classNames = undefined,
    children,
  }: Props = $props();

  const { map } = mapContext();

  let el: HTMLDivElement | undefined = $state();
  let control = {
    onAdd() {
      return el!;
    },
    onRemove() {
      el?.parentNode?.removeChild(el);
    },
  };

  $effect(() => {
    if (el) {
      map.addControl(control, position);
    }
  });

  onDestroy(() => {
    map.removeControl(control);
  });
</script>

<div bind:this={el} class={classNames} class:maplibregl-ctrl={defaultStyling}>
  {@render children?.()}
</div>
