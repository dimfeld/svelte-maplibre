<script>
  import '@skeletonlabs/skeleton/themes/theme-rocket.css';
  import '@skeletonlabs/skeleton/styles/all.css';
  import '../app.postcss';

  import hljs from 'highlight.js';
  import hljsSvelte from 'highlightjs-svelte';
  import 'highlight.js/styles/github-dark.css';
  import { storeHighlightJs } from '@skeletonlabs/skeleton';

  hljsSvelte(hljs);
  storeHighlightJs.set(hljs);
</script>

<slot />
