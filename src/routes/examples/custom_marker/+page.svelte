<script lang="ts">
  import Example from '$site/Example.svelte';
  import Map from '$lib/Map.svelte';
  import Marker from '$lib/Marker.svelte';
</script>

<Example name="Custom Marker">
  <Map>
    <Marker lngLat={[-125, 44]} on:click={() => alert('ABC!')}>
      <div
        class="cursor-pointer w-8 h-8 bg-red-300 text-black rounded-full grid place-items-center"
      >
        ABC
      </div>
    </Marker>
  </Map>
</Example>
