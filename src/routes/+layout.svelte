<script lang="ts">
  import '../app.postcss';
  import { AppShell, AppBar, Drawer, initializeStores } from '@skeletonlabs/skeleton';
  import type { Snippet } from 'svelte';

  import hljs from 'highlight.js';
  import hljsSvelte from 'highlightjs-svelte';
  import 'highlight.js/styles/github-dark.css';
  import { storeHighlightJs } from '@skeletonlabs/skeleton';

  import NavBar from './NavBar.svelte';
  import LogoAndMenu from './LogoAndMenu.svelte';
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  initializeStores();
  hljsSvelte(hljs);
  storeHighlightJs.set(hljs);
</script>

<Drawer bgDrawer="bg-surface-200">
  <NavBar inDrawer />
</Drawer>

<AppShell slotHeader="lg:hidden block" slotSidebarLeft="bg-surface-500/5">
  {#snippet header()}
    <AppBar background="bg-surface-500/5">
      <LogoAndMenu />
    </AppBar>
  {/snippet}
  {#snippet sidebarLeft()}
    <NavBar class="hidden lg:block" />
  {/snippet}
  <main class="p-4">
    {@render children?.()}
  </main>
</AppShell>
