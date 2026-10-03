// Extract API documentation from the library source. This runs in Node, from the Vite plugin in
// `vite-plugin.ts`, and must not be imported by code that runs in the browser.
//
// The process:
// 1. svelte2tsx emits declaration files for `src/lib`, so that the Svelte components have
//    real TypeScript types.
// 2. The TypeScript compiler reads the declarations to get the props, types, and doc comments.
// 3. The Svelte compiler parses each component to get the default values and bindable props,
//    which are not part of the types.
// 4. The examples are scanned to find which components and helpers each example uses.

import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parse } from 'svelte/compiler';
import { emitDts } from 'svelte2tsx';
import ts from 'typescript';
import { examples as exampleList } from '../examples.js';
import { componentCategories, modules as moduleConfig, OTHER_CATEGORY } from './config.js';
import { renderMarkdown, summarize } from './markdown.js';
import type {
  ApiDocs,
  ApiItem,
  ApiItemKind,
  ComponentDoc,
  DocTag,
  ExampleRef,
  MemberDoc,
  ModuleDoc,
} from './types.js';

const require = createRequire(import.meta.url);

export interface ExtractOptions {
  /** The project root directory */
  root: string;
}

export async function extractApiDocs({ root }: ExtractOptions): Promise<ApiDocs> {
  const libDir = path.join(root, 'src/lib');
  const declarationDir = path.join(root, 'node_modules/.cache/api-docs');

  await fs.rm(declarationDir, { recursive: true, force: true });
  await emitDts({
    declarationDir,
    libRoot: libDir,
    svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
    tsconfig: path.join(root, 'tsconfig.json'),
  });

  const indexFile = path.join(declarationDir, 'index.d.ts');
  const program = ts.createProgram([indexFile], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    types: [],
  });
  const checker = program.getTypeChecker();

  const usage = await scanExamples(root);

  const indexExports = moduleExports(program, checker, indexFile);
  const indexNames = new Set(indexExports.map((s) => s.name));

  const components: ComponentDoc[] = [];
  for (const symbol of indexExports) {
    const target = resolveAlias(checker, symbol);
    const decl = target.valueDeclaration ?? target.declarations?.[0];
    const match =
      decl && /^(.+)\.svelte\.d\.ts$/.exec(path.basename(decl.getSourceFile().fileName));
    if (!decl || !match) {
      continue;
    }

    const file = `${match[1]}.svelte`;
    const sourcePath = path.join(libDir, file);
    const source = await fs.readFile(sourcePath, 'utf8').catch(() => null);
    if (source === null) {
      // A `.svelte.ts` module such as `context.svelte.ts`, not a component.
      continue;
    }

    components.push(
      componentDoc(checker, symbol.name, file, target, decl, source, usage.componentExamples)
    );
  }

  const modules: ModuleDoc[] = [];
  for (const mod of moduleConfig) {
    const dtsFile = path.join(declarationDir, mod.file.replace(/\.ts$/, '.d.ts'));
    const importPath = `svelte-maplibre/${mod.file.replace(/\.ts$/, '.js')}`;
    const items = moduleExports(program, checker, dtsFile)
      .map((symbol) =>
        apiItem(
          checker,
          symbol,
          declarationDir,
          indexNames.has(symbol.name) ? 'svelte-maplibre' : importPath,
          usage.nameExamples
        )
      )
      .filter((item): item is ApiItem => !!item);

    modules.push({
      slug: mod.slug,
      title: mod.title,
      file: mod.file,
      description: renderMarkdown(mod.description),
      items,
    });
  }

  return {
    components: sortComponents(components),
    modules,
    examples: exampleList,
    exampleComponents: Object.fromEntries(
      [...usage.exampleUses].map(([href, names]) => [
        href,
        [...names].filter((n) => components.some((c) => c.name === n)).sort(),
      ])
    ),
  };
}

function moduleExports(program: ts.Program, checker: ts.TypeChecker, file: string) {
  const sourceFile = program.getSourceFile(file);
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error(`Could not read declarations for ${file}`);
  }

  return checker.getExportsOfModule(moduleSymbol);
}

function resolveAlias(checker: ts.TypeChecker, symbol: ts.Symbol) {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
}

function docComment(checker: ts.TypeChecker, symbol: ts.Symbol) {
  const text = ts.displayPartsToString(symbol.getDocumentationComment(checker));
  const tags: DocTag[] = symbol.getJsDocTags(checker).map((tag) => ({
    name: tag.name,
    text: ts.displayPartsToString(tag.text),
  }));

  return { text, tags };
}

function stripDeclare(text: string) {
  return text.replace(/^export\s+/, '').replace(/^declare\s+/, '');
}

/** Find the name of the type that declares a member. Returns undefined for the component's own props. */
function declaringTypeName(decl: ts.Node, ownerName: string): string | undefined {
  for (let node: ts.Node | undefined = decl.parent; node; node = node.parent) {
    if (
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isClassDeclaration(node)
    ) {
      const name = node.name?.text;
      return !name || name === ownerName || name === 'Props' ? undefined : name;
    }

    if (ts.isFunctionDeclaration(node)) {
      // svelte2tsx puts inline props types inside a `$$render` function.
      return undefined;
    }
  }

  return undefined;
}

function memberDoc(
  checker: ts.TypeChecker,
  member: ts.Symbol,
  ownerName: string,
  location: ts.Node
): MemberDoc {
  const decl = member.declarations?.[0];
  const optional = !!(member.flags & ts.SymbolFlags.Optional);

  let type: string;
  if (decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
    // Use the type as written, which is usually much easier to read than the resolved type.
    type = decl.type.getText();
  } else {
    type = checker.typeToString(
      checker.getTypeOfSymbolAtLocation(member, decl ?? location),
      undefined,
      ts.TypeFormatFlags.NoTruncation
    );
  }

  if (optional) {
    type = type.replace(/\s*\|\s*undefined$/, '');
  }
  type = type.replace(/\s+/g, ' ');

  const { text, tags } = docComment(checker, member);
  const defaultTag = tags.find((t) => t.name === 'default');

  return {
    name: member.name,
    type,
    optional,
    description: renderMarkdown(text),
    tags: tags.filter((t) => t.name !== 'default'),
    default: defaultTag?.text || undefined,
    inheritedFrom: decl ? declaringTypeName(decl, ownerName) : undefined,
  };
}

function orderMembers(members: MemberDoc[]) {
  // Show the props declared directly on the component first.
  return [...members.filter((m) => !m.inheritedFrom), ...members.filter((m) => m.inheritedFrom)];
}

interface PropDefaults {
  defaults: Map<string, string>;
  bindable: Set<string>;
}

/** Read the default values and `$bindable` props from the component's `$props()` destructuring. */
function readPropDefaults(source: string, file: string): PropDefaults {
  const result: PropDefaults = { defaults: new Map(), bindable: new Set() };

  let ast;
  try {
    ast = parse(source, { modern: true, filename: file });
  } catch (e) {
    console.warn(`api-docs: failed to parse ${file}`, e);
    return result;
  }

  type Node = { type: string; start: number; end: number; [key: string]: any };
  const text = (node: Node) => source.slice(node.start, node.end);

  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    const n = node as Node;
    if (
      n.type === 'VariableDeclarator' &&
      n.init?.type === 'CallExpression' &&
      n.init.callee?.name === '$props' &&
      n.id?.type === 'ObjectPattern'
    ) {
      for (const prop of n.id.properties) {
        if (prop.type !== 'Property') {
          continue;
        }

        const name = prop.key.type === 'Identifier' ? prop.key.name : String(prop.key.value);
        if (prop.value.type !== 'AssignmentPattern') {
          continue;
        }

        let valueNode: Node | undefined = prop.value.right;
        if (valueNode?.type === 'CallExpression' && valueNode.callee?.name === '$bindable') {
          result.bindable.add(name);
          valueNode = valueNode.arguments[0];
        }

        const value = valueNode ? text(valueNode) : undefined;
        if (value && value !== 'undefined') {
          result.defaults.set(name, value.replace(/\s+/g, ' '));
        }
      }
      return;
    }

    for (const [key, value] of Object.entries(n)) {
      if (key !== 'parent' && key !== 'metadata') {
        visit(value);
      }
    }
  };

  visit(ast.instance?.content);
  return result;
}

function componentDescription(source: string) {
  const match = /<!--\s*@component([\s\S]*?)-->/.exec(source);
  return match ? match[1].trim() : '';
}

function componentDoc(
  checker: ts.TypeChecker,
  name: string,
  file: string,
  symbol: ts.Symbol,
  decl: ts.Declaration,
  source: string,
  examples: Map<string, Set<string>>
): ComponentDoc {
  const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
  // Svelte components are typed as functions taking `(internals, props)`.
  const signature = type.getCallSignatures()[0];
  const propsParam = signature?.parameters[1];

  const { defaults, bindable } = readPropDefaults(source, file);

  let props: MemberDoc[] = [];
  if (propsParam) {
    const propsType = checker.getTypeOfSymbolAtLocation(propsParam, decl);
    props = checker.getPropertiesOfType(propsType).map((member) => {
      const doc = memberDoc(checker, member, name, decl);
      return {
        ...doc,
        default: defaults.get(member.name) ?? doc.default,
        bindable: bindable.has(member.name),
      };
    });
  }

  const description = componentDescription(source);
  const generics = signature?.typeParameters
    ?.map((tp) => tp.symbol.declarations?.[0]?.getText() ?? tp.symbol.name)
    .join(', ');

  const category =
    Object.entries(componentCategories).find(([, names]) => names.includes(name))?.[0] ??
    OTHER_CATEGORY;

  return {
    name,
    file,
    category,
    summary: summarize(description),
    description: renderMarkdown(description),
    generics: generics || undefined,
    props: orderMembers(props),
    examples: examplesFor(examples, name),
  };
}

function declarationKind(decl: ts.Declaration): ApiItemKind | undefined {
  if (ts.isFunctionDeclaration(decl)) return 'function';
  if (ts.isClassDeclaration(decl)) return 'class';
  if (ts.isInterfaceDeclaration(decl)) return 'interface';
  if (ts.isTypeAliasDeclaration(decl)) return 'type';
  if (ts.isVariableDeclaration(decl)) return 'variable';
  return undefined;
}

function packageName(fileName: string) {
  const match = /node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(fileName.split(path.sep).join('/'));
  return match?.[1] ?? 'unknown';
}

function apiItem(
  checker: ts.TypeChecker,
  symbol: ts.Symbol,
  declarationDir: string,
  importFrom: string,
  examples: Map<string, Set<string>>
): ApiItem | undefined {
  const target = resolveAlias(checker, symbol);
  const decls = target.declarations ?? [];
  const decl = decls.find((d) => declarationKind(d)) ?? decls[0];
  const kind = decl && declarationKind(decl);
  if (!decl || !kind) {
    return undefined;
  }

  const { text, tags } = docComment(checker, target);
  const base = {
    name: symbol.name,
    kind,
    importFrom,
    summary: summarize(text),
    description: renderMarkdown(text),
    tags,
    examples: examplesFor(examples, symbol.name),
  };

  const fileName = decl.getSourceFile().fileName;
  if (!path.resolve(fileName).startsWith(declarationDir)) {
    const from = packageName(fileName);
    const sourceName =
      target.name === symbol.name ? symbol.name : `${target.name} as ${symbol.name}`;
    return {
      ...base,
      signature: `export type { ${sourceName} } from '${from}';`,
      reexportedFrom: from,
    };
  }

  let signature: string;
  if (kind === 'function') {
    signature = decls
      .filter(ts.isFunctionDeclaration)
      .map((d) => stripDeclare(d.getText()))
      .join('\n');
  } else if (kind === 'variable') {
    signature = stripDeclare(decl.parent.parent.getText());
  } else {
    signature = stripDeclare(decl.getText());
  }

  let members: MemberDoc[] | undefined;
  if (kind === 'interface') {
    members = orderMembers(
      checker
        .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(target))
        .map((m) => memberDoc(checker, m, symbol.name, decl))
    );
  }

  return { ...base, signature, members };
}

function examplesFor(examples: Map<string, Set<string>>, name: string): ExampleRef[] {
  const hrefs = examples.get(name);
  if (!hrefs) {
    return [];
  }

  return exampleList.filter((e) => hrefs.has(e.href));
}

function sortComponents(components: ComponentDoc[]) {
  const categories = [...Object.keys(componentCategories), OTHER_CATEGORY];
  const order = (c: ComponentDoc) => {
    const names = componentCategories[c.category] ?? [];
    const index = names.indexOf(c.name);
    return categories.indexOf(c.category) * 1000 + (index === -1 ? 999 : index);
  };

  return components.sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
}

interface ExampleUsage {
  /** Component name -> example hrefs */
  componentExamples: Map<string, Set<string>>;
  /** Non-component export name -> example hrefs */
  nameExamples: Map<string, Set<string>>;
  /** Example href -> names of everything it imports from the library */
  exampleUses: Map<string, Set<string>>;
}

const IMPORT_RE = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;

function parseNamedImports(clause: string): string[] {
  const braces = /\{([\s\S]*)\}/.exec(clause);
  if (!braces) {
    return [];
  }

  return braces[1]
    .split(',')
    .map((part) =>
      part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        .trim()
    )
    .filter(Boolean);
}

/** Find everything from the library that an example uses, following its local imports. */
async function scanExampleFile(
  file: string,
  uses: Set<string>,
  visited: Set<string>
): Promise<void> {
  if (visited.has(file)) {
    return;
  }
  visited.add(file);

  const source = await fs.readFile(file, 'utf8').catch(() => null);
  if (source === null) {
    return;
  }

  for (const match of source.matchAll(IMPORT_RE)) {
    const [, clause, specifier] = match;
    const libPath = /^(?:\$lib|svelte-maplibre)(\/.*)?$/.exec(specifier);

    if (libPath) {
      const svelteFile = /\/([^/]+)\.svelte$/.exec(libPath[1] ?? '');
      if (svelteFile) {
        uses.add(svelteFile[1]);
      } else {
        parseNamedImports(clause).forEach((name) => uses.add(name));
      }
    } else if (specifier.startsWith('.') && /\.(svelte|ts|js)$/.test(specifier)) {
      const resolved = path.resolve(path.dirname(file), specifier.replace(/\.js$/, '.ts'));
      await scanExampleFile(resolved, uses, visited);
    }
  }
}

async function scanExamples(root: string): Promise<ExampleUsage> {
  const usage: ExampleUsage = {
    componentExamples: new Map(),
    nameExamples: new Map(),
    exampleUses: new Map(),
  };

  for (const example of exampleList) {
    const file = path.join(root, 'src/routes', example.href, '+page.svelte');
    const uses = new Set<string>();
    await scanExampleFile(file, uses, new Set());
    usage.exampleUses.set(example.href, uses);

    for (const name of uses) {
      // Component names start with an uppercase letter, but so do some types, so record both maps
      // and let the lookup decide which one applies.
      const isComponentName = /^[A-Z]/.test(name);
      const map = isComponentName ? usage.componentExamples : usage.nameExamples;
      if (!map.has(name)) map.set(name, new Set());
      map.get(name)!.add(example.href);
      if (isComponentName) {
        if (!usage.nameExamples.has(name)) usage.nameExamples.set(name, new Set());
        usage.nameExamples.get(name)!.add(example.href);
      }
    }
  }

  return usage;
}
