<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';

  export let code: string;
  export let startBoundary = '<Map ';
  export let endBoundary = '</Map>';
  export let includeBoundaries = true;

  function getExtract(code: string, start: string, end: string, includeBoundaries = false) {
    let startIndex = code.indexOf(start);
    let endIndex = code.indexOf(end, startIndex);

    if (includeBoundaries) {
      endIndex += end.length;
    } else {
      // Assume that the boundary text is on its own line when we're using this.
      startIndex = code.indexOf('\n', startIndex);
    }

    return code.slice(startIndex, endIndex).trim();
  }

  $: output = getExtract(code, startBoundary, endBoundary, includeBoundaries);
</script>

<div class="my-4 flex flex-col w-full items-stretch">
  <CodeBlock language="svelte" background="bg-gray-800" code={output} />
</div>
