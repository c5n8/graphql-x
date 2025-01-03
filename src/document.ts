import type { DefinitionNode } from 'graphql'

export function createDocument(): Document {
  return {
    bundles: [],
    globals: [],
  }
}

export interface Document {
  bundles: Bundle[]
  globals: DefinitionNode[]
}

export interface Bundle {
  node: DefinitionNode
  expansions: DefinitionNode[]
}
