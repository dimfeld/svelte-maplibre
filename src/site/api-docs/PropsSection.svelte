<script lang="ts">
  import MemberList from './MemberList.svelte';
  import TypeText from './TypeText.svelte';
  import type { MemberDoc } from './types.js';

  interface Props {
    members: MemberDoc[];
    title?: string;
    anchorPrefix?: string;
  }

  let { members, title = 'Props', anchorPrefix = '' }: Props = $props();

  // Group the members by the type which they come from, with the members declared directly first.
  let groups = $derived.by(() => {
    const result = new Map<string, MemberDoc[]>();
    for (const member of members) {
      const key = member.inheritedFrom ?? '';
      if (!result.has(key)) result.set(key, []);
      result.get(key)!.push(member);
    }
    return [...result.entries()];
  });
</script>

{#if members.length}
  <section class="my-6">
    <h2 class="doc-h2">{title}</h2>
    {#each groups as [from, groupMembers] (from)}
      {#if from}
        <h3 class="doc-h3">Inherited from <TypeText type={from} /></h3>
      {/if}
      <MemberList members={groupMembers} {anchorPrefix} />
    {/each}
  </section>
{/if}
