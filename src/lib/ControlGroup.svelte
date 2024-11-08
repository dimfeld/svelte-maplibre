<script lang="ts">
  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: classNames = '', children }: Props = $props();
</script>

<div class="maplibregl-ctrl-group {classNames}">
  {@render children?.()}
</div>
