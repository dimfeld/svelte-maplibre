<script lang="ts">
  let classNames: string = '';
  export { classNames as class };
</script>

<div class="maplibregl-ctrl-group {classNames}">
  <slot />
</div>
