<script lang="ts">
  /** True if this is an icon button. This will both enable the built-in MapLibre
   * icon button styling and center the element inside the button.
   * @default true since most map buttons are icons. */
  export let icon = true;
  export let center = true;
  let classNames: string | undefined = undefined;
  export { classNames as class };
</script>

<button type="button" on:click>
  <div class:maplibregl-ctrl-icon={icon} class:ctrl-btn-center={center} class={classNames}>
    <slot />
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
