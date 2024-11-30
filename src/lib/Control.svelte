<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import type maplibregl from 'maplibre-gl';
  import { getMapContext } from './context.svelte.js';

  interface Props {
    defaultStyling?: boolean;
    position?: maplibregl.ControlPosition;
    class?: string | undefined;
    children?: Snippet;
  }

  let {
    defaultStyling = true,
    position = 'top-right',
    class: classNames = undefined,
    children,
  }: Props = $props();

  const { map } = $derived(getMapContext());

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
