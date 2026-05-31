<script lang="ts">
  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<a href="/" class={className}>
  <img
    src="/logos/svelte-maplibre-logo-monochrome-dark.svg"
    alt="Svelte Maplibre"
    class="h-10 dark:invert"
  />
</a>
