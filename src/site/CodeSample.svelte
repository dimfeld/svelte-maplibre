<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';
  import dedent from 'dedent';

  export let code: string;
  export let filename = '';
  export let startBoundary = '<MapLibre';
  export let endBoundary = '</MapLibre>';
  export let omitStartBoundary = false;
  export let omitEndBoundary = false;
  export let language = 'svelte';

  function getExtract(
    code: string,
    start: string,
    end: string,
    omitStartBoundary = false,
    omitEndBoundary = false
  ) {
    let startIndex = start.length ? code.indexOf(start) : 0;
    let endIndex = end.length ? code.indexOf(end, startIndex) : code.length;

    if (!omitEndBoundary) {
      endIndex += end.length;
    }

    if (omitStartBoundary) {
      // Assume that the boundary text is on its own line when we're using this.
      startIndex = code.indexOf('\n', startIndex) + 1;
    }

    let outputCode = code.slice(startIndex, endIndex);

    const needsDedent = outputCode.split('\n').every((line) => {
      return !line || /^\s+/.test(line);
    });

    if (needsDedent) {
      outputCode = dedent(outputCode);
    }

    outputCode = outputCode.trim();

    if (filename) {
      outputCode = `<!-- File: ${filename} -->\n${outputCode}`;
    }

    return outputCode;
  }

  $: output = getExtract(code, startBoundary, endBoundary, omitStartBoundary, omitEndBoundary);
</script>

<div class="my-4 flex flex-col w-full items-stretch">
  <CodeBlock {language} background="bg-gray-800" code={output} />
</div>
