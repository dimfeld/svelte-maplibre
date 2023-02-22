<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';

  export let code: string;
  export let startBoundary = '<Map';
  export let endBoundary = '</Map>';
  export let omitStartBoundary = false;
  export let omitEndBoundary = false;

  function getExtract(
    code: string,
    start: string,
    end: string,
    omitStartBoundary = false,
    omitEndBoundary = false
  ) {
    let startIndex = code.indexOf(start);
    let endIndex = code.indexOf(end, startIndex);

    if (!omitEndBoundary) {
      endIndex += end.length;
    }

    if (omitStartBoundary) {
      // Assume that the boundary text is on its own line when we're using this.
      startIndex = code.indexOf('\n', startIndex);
    }

    return code.slice(startIndex, endIndex).trim();
  }

  $: output = getExtract(code, startBoundary, endBoundary, omitStartBoundary, omitEndBoundary);
</script>

<div class="my-4 flex flex-col w-full items-stretch">
  <CodeBlock language="svelte" background="bg-gray-800" code={output} />
</div>
