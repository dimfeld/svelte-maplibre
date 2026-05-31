<script lang="ts" module>
  export type Side = 'top' | 'right' | 'bottom' | 'left';
</script>

<script lang="ts">
  import { Dialog as SheetPrimitive } from 'bits-ui';
  import type { Snippet } from 'svelte';
  import XIcon from '@lucide/svelte/icons/x';
  import SheetPortal from './sheet-portal.svelte';
  import SheetOverlay from './sheet-overlay.svelte';
  import { cn, type WithoutChildrenOrChild } from '$site/utils.js';
  import type { ComponentProps } from 'svelte';

  let {
    ref = $bindable(null),
    class: className,
    side = 'right',
    showCloseButton = true,
    portalProps,
    children,
    ...restProps
  }: WithoutChildrenOrChild<SheetPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SheetPortal>>;
    side?: Side;
    showCloseButton?: boolean;
    children: Snippet;
  } = $props();
</script>

<SheetPortal {...portalProps}>
  <SheetOverlay />
  <SheetPrimitive.Content
    bind:ref
    data-slot="sheet-content"
    data-side={side}
    class={cn(
      'bg-background data-open:animate-in data-closed:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-closed:duration-300 data-open:duration-500',
      'data-[side=right]:data-closed:slide-out-to-right data-[side=right]:data-open:slide-in-from-right data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:sm:max-w-sm',
      'data-[side=left]:data-closed:slide-out-to-left data-[side=left]:data-open:slide-in-from-left data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:sm:max-w-sm',
      'data-[side=top]:data-closed:slide-out-to-top data-[side=top]:data-open:slide-in-from-top data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b',
      'data-[side=bottom]:data-closed:slide-out-to-bottom data-[side=bottom]:data-open:slide-in-from-bottom data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t',
      className
    )}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <SheetPrimitive.Close
        data-slot="sheet-close"
        class="ring-offset-background focus-visible:ring-ring data-open:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none"
      >
        <XIcon class="size-4" />
        <span class="sr-only">Close</span>
      </SheetPrimitive.Close>
    {/if}
  </SheetPrimitive.Content>
</SheetPortal>
