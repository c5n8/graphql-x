import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import type { InputValueDefinitionNode } from 'graphql'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import type { ObjectTypeDefinitionNode } from 'graphql'
import { parse } from 'graphql'
import type { StringValueNode } from 'graphql'

interface Context {
  shared: Record<string, DefinitionNode>
  grouped: Record<string, DefinitionNode[]>
}

export default async (document: Document) => {
  const bundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
      bundle.node.directives?.find(
        (directive) => directive.name.value === 'list',
      ) !== undefined,
  )

  const context: Context = {
    shared: {},
    grouped: {},
  }

  for (const bundle of bundles) {
    addMutation(bundle.node, bundle, document, context)
  }

  const schemaGlobals = await invoke(async () => {
    let x

    x = await import('./globals.gql?raw')
    x = x.default
    x = parse(x).definitions

    return x
  })

  // document.globals.push(...schemaGlobals)

  return document
}

function addMutation(
  node: ObjectTypeDefinitionNode,
  bundle: Bundle,
  document: Document,
  context: Context,
) {
  const fieldName = node.directives
    ?.find((directive) => directive.name.value === 'list')
    ?.arguments?.find(
      (argument): argument is typeof argument & { value: StringValueNode } =>
        argument.name.value === 'field' && argument.value.kind === Kind.STRING,
    )?.value.value

  if (fieldName === undefined) {
    throw new Error('@list directive requires field argument')
  }

  const typeWhereInput = `${node.name.value}WhereInput`

  // eslint-disable-next-line security/detect-object-injection
  context.shared[typeWhereInput] ??= {
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: typeWhereInput,
    },
    fields: [
      ...(node.fields ?? []).flatMap<InputValueDefinitionNode>((field) => {
        const fieldType = invoke(function getFieldType(fieldType = field.type) {
          if (fieldType.kind === Kind.NAMED_TYPE) {
            const supportedScalars = [
              'Boolean',
              'Int',
              'Float',
              'String',
              'DateTime',
            ]

            if (supportedScalars.includes(fieldType.name.value)) {
              return `${fieldType.name.value}FilterInput`
            }

            const relatedObjectType = document.bundles.find(
              (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                bundle.node.name.value === fieldType.name.value,
            )?.node.name.value

            if (relatedObjectType !== undefined) {
              return `${relatedObjectType}RelationFilterInput`
            }
          }

          if (fieldType.kind === Kind.LIST_TYPE) {
            const nestedFieldType = invoke(
              (nestedFieldType = fieldType.type) => {
                if (nestedFieldType.kind === Kind.NAMED_TYPE) {
                  return nestedFieldType.name.value
                }

                if (
                  nestedFieldType.kind === Kind.NON_NULL_TYPE &&
                  nestedFieldType.type.kind === Kind.NAMED_TYPE
                ) {
                  return nestedFieldType.type.name.value
                }
              },
            )

            if (nestedFieldType !== undefined) {
              const relatedObjectType = document.bundles.find(
                (
                  bundle,
                ): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                  bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                  bundle.node.name.value === nestedFieldType,
              )?.node.name.value

              if (relatedObjectType !== undefined) {
                return `${relatedObjectType}ListRelationFilterInput`
              }
            }

            return getFieldType(fieldType.type)
          }

          if (fieldType.kind === Kind.NON_NULL_TYPE) {
            return getFieldType(fieldType.type)
          }
        })

        if (fieldType === undefined) {
          return []
        }

        return [
          {
            kind: Kind.INPUT_VALUE_DEFINITION,
            name: { kind: Kind.NAME, value: field.name.value },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: fieldType,
              },
            },
          },
        ]
      }),
      ...['OR', 'AND', 'NOT'].map<InputValueDefinitionNode>((field) => ({
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: field,
        },
        type: {
          kind: Kind.LIST_TYPE,
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: typeWhereInput,
              },
            },
          },
        },
      })),
    ],
  }

  const typeOrderByInput = `${node.name.value}OrderByInput`

  // eslint-disable-next-line security/detect-object-injection
  context.shared[typeOrderByInput] ??= {
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: typeOrderByInput,
    },
    fields: (node.fields ?? []).flatMap<InputValueDefinitionNode>((field) => {
      const fieldType = invoke(function getFieldType(fieldType = field.type) {
        if (fieldType.kind === Kind.NAMED_TYPE) {
          if (fieldType.name.value === 'ID') {
            return
          }

          const relatedObjectType = document.bundles.find(
            (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
              bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
              bundle.node.name.value === fieldType.name.value,
          )?.node.name.value

          if (relatedObjectType !== undefined) {
            return `${relatedObjectType}OrderByInput`
          }

          return `SortOrderInput`
        }

        if (fieldType.kind === Kind.LIST_TYPE) {
          const nestedFieldType = invoke((nestedFieldType = fieldType.type) => {
            if (nestedFieldType.kind === Kind.NAMED_TYPE) {
              return nestedFieldType.name.value
            }

            if (
              nestedFieldType.kind === Kind.NON_NULL_TYPE &&
              nestedFieldType.type.kind === Kind.NAMED_TYPE
            ) {
              return nestedFieldType.type.name.value
            }
          })

          if (nestedFieldType !== undefined) {
            const relatedObjectType = document.bundles.find(
              (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                bundle.node.name.value === nestedFieldType,
            )?.node.name.value

            if (relatedObjectType !== undefined) {
              return `OrderByRelationAggregateInput`
            }
          }

          return getFieldType(fieldType.type)
        }

        if (fieldType.kind === Kind.NON_NULL_TYPE) {
          return getFieldType(fieldType.type)
        }
      })

      if (fieldType === undefined) {
        return []
      }

      return [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: { kind: Kind.NAME, value: field.name.value },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: fieldType,
            },
          },
        },
      ]
    }),
  }

  bundle.expansions.push(
    {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name: { kind: Kind.NAME, value: 'Query' },
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
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: `${node.name.value}ListQueryInput`,
                },
              },
            },
          ],
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.LIST_TYPE,
              type: {
                kind: Kind.NON_NULL_TYPE,
                type: {
                  kind: Kind.NAMED_TYPE,
                  name: {
                    kind: Kind.NAME,
                    value: `${node.name.value}`,
                  },
                },
              },
            },
          },
        },
      ],
    },

    {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${node.name.value}ListQueryInput`,
      },
      fields: [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'take',
          },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: 'Int',
            },
          },
        },
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'where',
          },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: typeWhereInput,
            },
          },
        },
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'orderBy',
          },
          type: {
            kind: Kind.LIST_TYPE,
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: `${node.name.value}OrderByInput`,
                },
              },
            },
          },
        },
      ],
    },

    context.shared[typeWhereInput],
    context.shared[typeOrderByInput],
  )
}
