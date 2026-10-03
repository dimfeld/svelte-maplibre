import { error } from '@sveltejs/kit';
import docs from 'virtual:api-docs';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => docs.modules.map(({ slug }) => ({ module: slug }));

export const load: PageServerLoad = ({ params }) => {
  const mod = docs.modules.find((m) => m.slug === params.module);
  if (!mod) {
    error(404, `Module ${params.module} not found`);
  }

  return { title: mod.title, module: mod };
};
