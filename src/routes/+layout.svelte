<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import MenuIcon from '@lucide/svelte/icons/menu';

  import * as Sheet from '$site/components/ui/sheet';
  import { Button } from '$site/components/ui/button';
  import NavBar from './NavBar.svelte';
  import LogoAndMenu from './LogoAndMenu.svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let drawerOpen = $state(false);
</script>

<div class="bg-background text-foreground flex h-full w-full flex-col">
  <!-- Mobile header -->
  <header class="flex items-center gap-3 border-b px-4 py-2 lg:hidden">
    <Sheet.Root bind:open={drawerOpen}>
      <Sheet.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="ghost" size="icon" aria-label="Toggle menu">
            <MenuIcon class="size-6" />
          </Button>
        {/snippet}
      </Sheet.Trigger>
      <Sheet.Content side="left" class="w-80 p-0">
        <Sheet.Header class="sr-only">
          <Sheet.Title>Navigation</Sheet.Title>
          <Sheet.Description>Site navigation links</Sheet.Description>
        </Sheet.Header>
        <NavBar close={() => (drawerOpen = false)} />
      </Sheet.Content>
    </Sheet.Root>

    <LogoAndMenu />
  </header>

  <div class="flex flex-1 overflow-hidden">
    <!-- Desktop sidebar -->
    <aside class="bg-sidebar hidden w-72 shrink-0 border-r lg:block">
      <NavBar />
    </aside>

    <main class="flex-1 overflow-auto p-4">
      {@render children?.()}
    </main>
  </div>
</div>
