<script lang="ts">
  export let name: string;
</script>

<div class="w-full flex flex-col items-center mx-auto">
  <h1 class="mb-4">{name}</h1>

  <slot name="aboveMap" />

  <div class="relative w-full aspect-[9/16] max-h-[80vh] sm:w-11/12 sm:aspect-video">
    <slot />
  </div>

  <slot name="belowMap" />

  <a href="/">Back to Examples</a>
</div>
