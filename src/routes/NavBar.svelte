<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { dev } from '$app/environment';
  import { Button } from '$site/components/ui/button';
  import { examples, tests } from '$site/examples.js';
  import LogoAndMenu from './LogoAndMenu.svelte';

  interface Props {
    class?: string;
    /** Called after a navigation starts, used to close the mobile drawer. */
    close?: () => void;
  }

  let { class: className = '', close }: Props = $props();

  let docs = $derived($page.data.nav);
  let componentGroups = $derived.by(() => {
    const groups = new Map<string, string[]>();
    for (const { name, category } of docs?.components ?? []) {
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push(name);
    }
    return [...groups.entries()];
  });

  beforeNavigate(() => {
    close?.();
  });
</script>

<nav class="flex h-full w-full flex-col gap-4 overflow-y-auto p-4 {className}">
  <LogoAndMenu />

  <div>
    <h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
      Documentation
    </h2>
    <ul class="flex flex-col gap-0.5">
      <li>
        <Button
          href="/docs"
          variant={$page.url.pathname === '/docs' ? 'secondary' : 'ghost'}
          class="w-full justify-start font-normal"
        >
          Overview
        </Button>
      </li>
    </ul>
    {#each componentGroups as [category, names] (category)}
      <h3 class="text-muted-foreground mt-3 mb-1 px-2 text-xs font-medium">{category}</h3>
      <ul class="flex flex-col gap-0.5">
        {#each names as name (name)}
          {@const href = `/docs/components/${name}`}
          <li>
            <Button
              {href}
              variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
              size="sm"
              class="w-full justify-start font-mono font-normal"
            >
              {name}
            </Button>
          </li>
        {/each}
      </ul>
    {/each}
    <h3 class="text-muted-foreground mt-3 mb-1 px-2 text-xs font-medium">Helpers and Types</h3>
    <ul class="flex flex-col gap-0.5">
      {#each docs?.modules ?? [] as mod (mod.slug)}
        {@const href = `/docs/api/${mod.slug}`}
        <li>
          <Button
            {href}
            variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
            size="sm"
            class="w-full justify-start font-normal"
          >
            {mod.title}
          </Button>
        </li>
      {/each}
    </ul>
  </div>

  <div>
    <h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
      Examples
    </h2>
    <ul class="flex flex-col gap-0.5">
      {#each examples as { href, title } (href)}
        <li>
          <Button
            {href}
            variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
            class="w-full justify-start font-normal"
          >
            {title}
          </Button>
        </li>
      {/each}
    </ul>
  </div>

  {#if dev}
    <div>
      <h2 class="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wide uppercase">
        Tests
      </h2>
      <ul class="flex flex-col gap-0.5">
        {#each tests as { href, title } (href)}
          <li>
            <Button
              {href}
              variant={href === $page.url.pathname ? 'secondary' : 'ghost'}
              class="w-full justify-start font-normal"
            >
              {title}
            </Button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <p class="mt-2 px-2 text-sm">
    <a
      class="hover:text-primary underline underline-offset-4"
      href="https://github.com/dimfeld/svelte-maplibre"
    >
      Github
    </a>
  </p>
</nav>
