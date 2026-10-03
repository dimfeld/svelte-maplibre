import path from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { extractApiDocs } from './extract.js';
import type { ApiDocs } from './types.js';

const VIRTUAL_ID = 'virtual:api-docs';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

/** Provides the `virtual:api-docs` module, which exports the API docs extracted from `src/lib`. */
export function apiDocs(): Plugin {
  let root = process.cwd();
  let docs: Promise<ApiDocs> | null = null;

  const load = () => {
    docs ??= extractApiDocs({ root });
    return docs;
  };

  const invalidate = (server: ViteDevServer) => {
    docs = null;
    for (const environment of Object.values(server.environments)) {
      const mod = environment.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) {
        environment.moduleGraph.invalidateModule(mod);
      }
    }
  };

  return {
    name: 'svelte-maplibre-api-docs',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_ID;
      }
    },
    async load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${JSON.stringify(await load())};`;
      }
    },
    configureServer(server) {
      const watched = [path.join(root, 'src/lib'), path.join(root, 'src/routes/examples')];
      const onChange = (file: string) => {
        if (watched.some((dir) => file.startsWith(dir + path.sep))) {
          invalidate(server);
        }
      };

      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}
