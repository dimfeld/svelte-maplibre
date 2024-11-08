<script lang="ts">
  import { CodeBlock } from '@skeletonlabs/skeleton';
  import dedent from 'dedent';

  interface Props {
    code: string;
    filename?: string;
    startBoundary?: string;
    endBoundary?: string;
    omitStartBoundary?: boolean;
    omitEndBoundary?: boolean;
    language?: string;
  }

  let {
    code,
    filename = '',
    startBoundary = '<MapLibre',
    endBoundary = '</MapLibre>',
    omitStartBoundary = false,
    omitEndBoundary = false,
    language = 'svelte',
  }: Props = $props();

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

    // Dedent the snippet if every single nonblank line starts with whitespace. This is needed
    // because dedent ignores non-indented lines when figuring out how much to dedent, but in this
    // case we do want to account for that.
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

  let output = $derived(
    getExtract(code, startBoundary, endBoundary, omitStartBoundary, omitEndBoundary)
  );
</script>

<div class="my-4 flex w-full flex-col items-stretch">
  <CodeBlock {language} background="bg-gray-800" code={output} />
</div>
