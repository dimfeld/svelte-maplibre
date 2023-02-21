<script lang="ts">
  import Map from '$lib/Map.svelte';
  import CodeSample from '$site/CodeSample.svelte';
  import code from './+page.svelte?raw';
  import { mapClasses } from '../styles';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Map class={mapClasses} />

<CodeSample {code} startBoundary="<Map " endBoundary="/>" />
