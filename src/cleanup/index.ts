import type { DefinitionNode } from 'graphql'
import type { DocumentNode } from 'graphql'
import { Kind } from 'graphql'
import type { Mutable } from '#package/utils/mutable.js'

export default function (document: DocumentNode) {
  let types = ['Query', 'Mutation', 'Subscription']

  for (const node of document.definitions) {
    if (
      (node.kind === Kind.OBJECT_TYPE_DEFINITION ||
        node.kind === Kind.OBJECT_TYPE_EXTENSION) &&
      types.includes(node.name.value)
    ) {
      if (node.kind === Kind.OBJECT_TYPE_EXTENSION) {
        ;(node as Mutable<DefinitionNode>).kind = Kind.OBJECT_TYPE_DEFINITION
      }

      types = types.filter((type) => type !== node.name.value)

      if (types.length === 0) {
        return document
      }
    }
  }

  return document
}
