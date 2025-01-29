import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import type { ObjectTypeDefinitionNode } from 'graphql'

export default (document: Document) => {
  const bundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
      bundle.node.directives !== undefined &&
      bundle.node.directives.some(
        (directive) => directive.name.value === 'item',
      ),
  )

  for (const bundle of bundles) {
    // eslint-disable-next-line dot-notation
    bundle.groupedExpansions['item'] = addMutation(
      bundle.node,
    ) as DefinitionNode[]
  }

  return document
}

function addMutation(node: ObjectTypeDefinitionNode) {
  const fieldName = invoke(() => {
    let x

    x = [...node.name.value]
    // oxlint-disable no-non-null-assertion
    x.splice(0, 1, [...node.name.value][0]!.toLocaleLowerCase())
    x = x.join('')

    return x
  })

  return [
    {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name: {
        kind: Kind.NAME,
        value: 'Query',
      },
      fields: [
        {
          kind: Kind.FIELD_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: fieldName,
          },
          arguments: [
            {
              kind: Kind.INPUT_VALUE_DEFINITION,
              name: {
                kind: Kind.NAME,
                value: 'input',
              },
              type: {
                kind: Kind.NON_NULL_TYPE,
                type: {
                  kind: Kind.NAMED_TYPE,
                  name: {
                    kind: Kind.NAME,
                    value: `${node.name.value}ItemInput`,
                  },
                },
              },
            },
          ],
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: `${node.name.value}`,
            },
          },
        },
      ],
    },
    {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${node.name.value}ItemInput`,
      },
      fields: [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'id',
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: 'ID',
              },
            },
          },
        },
      ],
    },
  ]
}
