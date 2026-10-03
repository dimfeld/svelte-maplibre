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

<!-- @component
Show a button with the styling of the built-in MapLibre control buttons. Use it inside a `ControlGroup`.

When `icon` is `true`, the content gets the `maplibregl-ctrl-icon` class. When `center` is `true`, the content is centered inside the button. Use `onclick` to handle clicks.
-->

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
