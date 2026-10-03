<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Snippet } from 'svelte';
  import type * as maplibregl from 'maplibre-gl';
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
    map?.addControl(control, position);
  });

  onDestroy(() => {
    map?.removeControl(control);
  });
</script>

<!-- @component
Add a custom control to the map. The children of this component become the content of the control.

Put it inside the `MapLibre` component. By default the control has the `maplibregl-ctrl` class. Set `defaultStyling` to `false` to remove it. Use `ControlGroup` and `ControlButton` inside it to make buttons that look like the built-in MapLibre controls.

```svelte
<Control position="top-left">
  <ControlGroup>
    <ControlButton onclick={doSomething}>A</ControlButton>
  </ControlGroup>
</Control>
```
-->

<div bind:this={el} class={classNames} class:maplibregl-ctrl={defaultStyling}>
  {@render children?.()}
</div>
