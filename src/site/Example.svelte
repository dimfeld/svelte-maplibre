<script lang="ts">
  export let name: string;
</script>

<div class="w-full flex flex-col items-center mx-auto">
  <h1>{name}</h1>

  <div class="relative w-5/6 aspect-video">
    <slot />
  </div>

  <a href="/">Back to Examples</a>
</div>
