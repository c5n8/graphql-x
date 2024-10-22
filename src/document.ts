import type { DefinitionNode } from 'graphql'

export interface Document {
  bundles: Bundle[]
}

export interface Bundle {
  node: DefinitionNode
  expansions: DefinitionNode[]
}
