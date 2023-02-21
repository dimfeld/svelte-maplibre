<script lang="ts">
  import Map from '$lib/Map.svelte';
  import { mapClasses } from '../styles';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Map class={mapClasses} />
