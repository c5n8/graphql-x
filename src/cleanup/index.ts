import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import { Kind } from 'graphql'
import type { Mutable } from '#package/utils/mutable.js'

export function cleanup(document: Document) {
  let types = ['Query', 'Mutation', 'Subscription']

  const nodes = document.bundles.flatMap((bundle) => [
    bundle.node,
    ...Object.values(bundle.groupedExpansions).flat(),
  ])

  for (const node of nodes) {
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
    /* v8 ignore next */
  }

  /* v8 ignore next 2 */
  return document
}
