import docs from 'virtual:api-docs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  return {
    title: 'API Documentation',
    components: docs.components.map(({ name, category, summary }) => ({ name, category, summary })),
    modules: docs.modules.map(({ slug, title, description, items }) => ({
      slug,
      title,
      description,
      count: items.length,
    })),
  };
};
