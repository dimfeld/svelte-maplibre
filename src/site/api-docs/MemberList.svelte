<script lang="ts">
  import DocTags from './DocTags.svelte';
  import TypeText from './TypeText.svelte';
  import type { MemberDoc } from './types.js';

  interface Props {
    members: MemberDoc[];
    /** The id prefix for each member's anchor */
    anchorPrefix?: string;
  }

  let { members, anchorPrefix = '' }: Props = $props();
</script>

<ul class="divide-y rounded-lg border">
  {#each members as member (member.name)}
    <li id="{anchorPrefix}{member.name}" class="scroll-mt-4 px-4 py-3">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a href="#{anchorPrefix}{member.name}" class="font-mono font-semibold hover:underline">
          {member.name}
        </a>
        {#if !member.optional}
          <span class="doc-badge doc-badge-required">required</span>
        {/if}
        {#if member.bindable}
          <span class="doc-badge">bindable</span>
        {/if}
        <span class="min-w-0 text-sm break-words"><TypeText type={member.type} /></span>
      </div>
      {#if member.default}
        <p class="text-muted-foreground mt-1 text-sm">
          Default: <code class="doc-type">{member.default}</code>
        </p>
      {/if}
      {#if member.description}
        <div class="doc-prose mt-1 text-sm">{@html member.description}</div>
      {/if}
      <DocTags tags={member.tags} />
    </li>
  {/each}
</ul>
