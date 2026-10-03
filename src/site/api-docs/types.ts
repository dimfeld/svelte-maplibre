// Types for the API documentation data that is extracted from `src/lib` at build time.
// See `extract.ts` for the code that creates this data.

export interface ExampleRef {
  href: string;
  title: string;
}

export interface DocTag {
  name: string;
  text: string;
}

export interface MemberDoc {
  name: string;
  type: string;
  optional: boolean;
  /** HTML rendered from the JSDoc comment */
  description: string;
  tags: DocTag[];
  /** Source text of the default value, if the component sets one. */
  default?: string;
  /** True if the prop can be used with `bind:`. */
  bindable?: boolean;
  /** The name of the type that this member comes from, if it is not declared directly on the component. */
  inheritedFrom?: string;
}

export interface ComponentDoc {
  name: string;
  /** The `src/lib` file name */
  file: string;
  category: string;
  /** Short plain text summary, from the first paragraph of the description */
  summary: string;
  /** HTML rendered from the `@component` comment */
  description: string;
  /** Generic type parameters, such as `FEATURE extends Feature = Feature` */
  generics?: string;
  props: MemberDoc[];
  examples: ExampleRef[];
}

export type ApiItemKind = 'function' | 'class' | 'interface' | 'type' | 'variable';

export interface ApiItem {
  name: string;
  kind: ApiItemKind;
  /** TypeScript declaration text, without the JSDoc comment */
  signature: string;
  /** Short plain text summary, from the first paragraph of the description */
  summary: string;
  description: string;
  tags: DocTag[];
  /** Interface members */
  members?: MemberDoc[];
  examples: ExampleRef[];
  /** The module to import this item from */
  importFrom: string;
  /** Set when the item is a type which this library re-exports from another package. */
  reexportedFrom?: string;
}

export interface ModuleDoc {
  /** URL slug for the module */
  slug: string;
  title: string;
  /** The `src/lib` file which declares the items */
  file: string;
  /** HTML description of the module */
  description: string;
  items: ApiItem[];
}

export interface ApiDocs {
  components: ComponentDoc[];
  modules: ModuleDoc[];
  examples: ExampleRef[];
  /** Components used by each example, keyed by example href */
  exampleComponents: Record<string, string[]>;
}
