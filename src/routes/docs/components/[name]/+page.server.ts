import { error } from '@sveltejs/kit';
import docs from 'virtual:api-docs';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => docs.components.map(({ name }) => ({ name }));

export const load: PageServerLoad = ({ params }) => {
  const component = docs.components.find((c) => c.name === params.name);
  if (!component) {
    error(404, `Component ${params.name} not found`);
  }

  return { title: component.name, component };
};
