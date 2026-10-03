<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: classNames = '', children }: Props = $props();
</script>

<!-- @component
Show a group of controls with the MapLibre `maplibregl-ctrl-group` styling. Use it inside a `Control` component to hold `ControlButton` components.
-->

<div class="maplibregl-ctrl-group {classNames}">
  {@render children?.()}
</div>
