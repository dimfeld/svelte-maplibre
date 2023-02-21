<script lang="ts">
  import { onDestroy } from 'svelte';
  import { mapContext } from './context';

  export let defaultStyling = true;
  export let position: maplibregl.ControlPosition = 'top-right';
  let classNames: string | undefined = undefined;
  export { classNames as class };

  const { map } = mapContext();

  let el: HTMLDivElement;
  let control = {
    onAdd() {
      return el;
    },
    onRemove() {
      el?.parentNode?.removeChild(el);
    },
  };

  $: if ($map && el) {
    $map.addControl(control, position);
  }

  onDestroy(() => {
    $map?.removeControl(control);
  });
</script>

<div bind:this={el} class={classNames} class:maplibregl-ctrl={defaultStyling}>
  <slot />
</div>
