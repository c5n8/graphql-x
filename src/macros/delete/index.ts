import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import { Kind } from 'graphql'
import type { ObjectTypeDefinitionNode } from 'graphql'

export default (document: Document) => {
  const bundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
      bundle.node.directives !== undefined &&
      bundle.node.directives.some(
        (directive) => directive.name.value === 'delete',
      ),
  )

  for (const bundle of bundles) {
    const expansions = addMutation(bundle.node) as DefinitionNode[]

    bundle.expansions.push(...expansions)
    // eslint-disable-next-line dot-notation
    bundle.groupedExpansions['delete'] = expansions
  }

  document.globals.push({
    kind: Kind.SCALAR_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: 'Void',
    },
  })

  return document
}

function addMutation(node: ObjectTypeDefinitionNode) {
  return [
    {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name: {
        kind: Kind.NAME,
        value: 'Mutation',
      },
      fields: [
        {
          kind: Kind.FIELD_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: `delete${node.name.value}`,
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
                    value: `Delete${node.name.value}Input`,
                  },
                },
              },
            },
          ],
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: `Void`,
            },
          },
        },
      ],
    },
    {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `Delete${node.name.value}Input`,
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
