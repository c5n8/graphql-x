import type { Bundle } from '#package/document.js'
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
    addMutation(bundle.node, bundle, document)
  }

  return document
}

function addMutation(
  node: ObjectTypeDefinitionNode,
  bundle: Bundle,
  document: Document,
) {
  bundle.expansions.push(
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
  )

  document.globals.push({
    kind: Kind.SCALAR_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: 'Void',
    },
  })
}
