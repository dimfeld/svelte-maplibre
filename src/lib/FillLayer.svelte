<script lang="ts">
  import { getId } from './context';
  import Layer from './Layer.svelte';

  export let id = getId('fill');
  /** Set the source for this layer. This can be omitted when the Layer is created in the slot
   * of a source component. */
  export let source: string | undefined = undefined;
  /** Draw this layer under another layer. This is only evaluated when the component is created. */
  export let beforeId: string | undefined;
  export let paint: maplibregl.FillPaintProps;
  export let filter: maplibregl.FilterSpecification | undefined = undefined;
</script>

<Layer {id} type="fill" {source} {beforeId} {paint} {filter} />
