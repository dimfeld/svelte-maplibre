import docs from 'virtual:api-docs';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
  // Pages link type names in type signatures to their docs.
  const typeLinks: Record<string, string> = {};
  for (const mod of docs.modules) {
    for (const item of mod.items) {
      if (!item.reexportedFrom) {
        typeLinks[item.name] ??= `/docs/api/${mod.slug}#${item.name}`;
      }
    }
  }

  return {
    nav: {
      components: docs.components.map((c) => ({ name: c.name, category: c.category })),
      modules: docs.modules.map((m) => ({ slug: m.slug, title: m.title })),
    },
    typeLinks,
    exampleComponents: docs.exampleComponents,
  };
};
