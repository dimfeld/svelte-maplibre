<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: classNames = '', children }: Props = $props();
</script>

<div class="maplibregl-ctrl-group {classNames}">
  {@render children?.()}
</div>
