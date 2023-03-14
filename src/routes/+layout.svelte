<script>
  import '@skeletonlabs/skeleton/themes/theme-rocket.css';
  import '@skeletonlabs/skeleton/styles/all.css';
  import '../app.postcss';

  import { AppShell, AppBar, Drawer, drawerStore } from '@skeletonlabs/skeleton';

  import hljs from 'highlight.js';
  import hljsSvelte from 'highlightjs-svelte';
  import 'highlight.js/styles/github-dark.css';
  import { storeHighlightJs } from '@skeletonlabs/skeleton';

  import NavBar from './NavBar.svelte';
  import LogoAndMenu from './LogoAndMenu.svelte';

  hljsSvelte(hljs);
  storeHighlightJs.set(hljs);
</script>

<Drawer bgDrawer="bg-surface-200">
  <NavBar inDrawer />
</Drawer>

<AppShell slotHeader="lg:hidden block" slotSidebarLeft="bg-surface-500/5">
  <svelte:fragment slot="header">
    <AppBar background="bg-surface-500/5">
      <LogoAndMenu />
    </AppBar>
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <NavBar class="hidden lg:block" />
  </svelte:fragment>
  <main class="p-4">
    <slot />
  </main>
</AppShell>
