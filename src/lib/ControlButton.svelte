<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** True if this is an icon button. This will both enable the built-in MapLibre
     * icon button styling and center the element inside the button.
     * @default true since most map buttons are icons. */
    icon?: boolean;
    center?: boolean;
    title?: string;
    class?: string;
    children?: Snippet;

    onclick?: (e: MouseEvent) => void;
  }

  let {
    icon = true,
    center = true,
    title = undefined,
    class: classNames = undefined,
    children,
    onclick,
  }: Props = $props();
</script>

<button type="button" {title} {onclick}>
  <div class:maplibregl-ctrl-icon={icon} class:ctrl-btn-center={center} class={classNames}>
    {@render children?.()}
  </div>
</button>

<style>
  .ctrl-btn-center {
    display: grid !important;
    height: 100%;
    width: 100%;
    place-items: center;
  }
</style>
