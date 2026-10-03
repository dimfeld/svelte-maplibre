<script lang="ts">
  import { page } from '$app/state';

  interface Props {
    type: string;
  }

  let { type }: Props = $props();

  // Split the type into identifiers and other text, so that identifiers which have their own
  // docs page can become links.
  let parts = $derived.by(() => {
    const links: Record<string, string> = page.data.typeLinks ?? {};
    return type.split(/([A-Za-z_$][\w$]*)/).map((text) => ({ text, href: links[text] }));
  });
</script>

<code class="doc-type"
  >{#each parts as part, i (i)}{#if part.href}<a href={part.href}>{part.text}</a
      >{:else}{part.text}{/if}{/each}</code
>
