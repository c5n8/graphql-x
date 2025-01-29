import type { DefinitionNode } from 'graphql'

export function createDocument<T extends Partial<Document>>(
  document: T,
): Document {
  return {
    bundles: [],
    globals: [],
    ...document,
  }
}

export function createBundle<
  T extends Pick<Bundle, 'node'> & Partial<Omit<Bundle, 'node'>>,
>(bundle: T): Bundle {
  return {
    expansions: [],
    groupedExpansions: {},
    directives: [],
    ...bundle,
  }
}

export interface Document {
  bundles: Bundle[]
  globals: DefinitionNode[]
}

export interface Bundle {
  node: DefinitionNode
  expansions: DefinitionNode[]
  groupedExpansions: Record<string, DefinitionNode[]>
  directives: string[]
}
