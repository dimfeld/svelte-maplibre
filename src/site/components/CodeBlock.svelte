<script lang="ts" module>
  import hljs from 'highlight.js';
  // @ts-expect-error No types
  import hljsSvelte from 'highlightjs-svelte/dist/index.mjs';

  // Register the Svelte language once for all instances.
  hljsSvelte(hljs);
</script>

<script lang="ts">
  import 'highlight.js/styles/github-dark.css';
  import { cn } from '$site/utils.js';

  interface Props {
    code: string;
    language?: string;
    class?: string;
  }

  let { code, language = 'svelte', class: className = undefined }: Props = $props();

  let highlighted = $derived.by(() => {
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  });
</script>

<!-- The github-dark highlight.js theme is designed for a dark background, so we
     pin the code surface dark in both light and dark site themes. -->
<pre
  class={cn(
    'overflow-x-auto rounded-lg border border-white/10 bg-[#0d1117] p-4 text-sm leading-relaxed shadow-sm',
    className
  )}><code class="hljs language-{language} !bg-transparent !p-0">{@html highlighted}</code></pre>
