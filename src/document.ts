import type { DefinitionNode } from 'graphql'

export interface Document {
  bundles: Bundle[]
  globals: DefinitionNode[]
}

export interface Bundle {
  node: DefinitionNode
  expansions: DefinitionNode[]
}
