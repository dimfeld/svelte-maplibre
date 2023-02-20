<script lang="ts">
  import Map from '$lib/Map.svelte';
  import Marker from '$lib/Marker.svelte';
</script>

<div class="relative w-screen h-screen">
  <Map>
    <Marker lngLat={[-125, 44]} on:click={() => alert('ABC!')}>
      <div class="cursor-pointer w-8 h-8 bg-red-500 rounded-full grid place-items-center">ABC</div>
    </Marker>
  </Map>
</div>
