<script lang="ts">
  export let name: string;
</script>

<div class="w-full flex flex-col items-center mx-auto">
  <h1>{name}</h1>

  <slot name="aboveMap" />

  <div class="relative w-5/6 aspect-video">
    <slot />
  </div>

  <slot name="belowMap" />

  <a href="/">Back to Examples</a>
</div>
