import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import type { InputObjectTypeDefinitionNode } from 'graphql'
import type { InputValueDefinitionNode } from 'graphql'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import type { Mutable } from '#package/utils/mutable.js'
import type { ObjectTypeDefinitionNode } from 'graphql'
import { schemaGlobals } from './globals.js'
import type { StringValueNode } from 'graphql'

interface Context {
  shared: Record<string, DefinitionNode>
  grouped: Record<string, Set<string>>
}

export default (document: Document) => {
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

  const objectTypeBundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION,
  )

  for (const bundle of objectTypeBundles) {
    const expansions = context.grouped[bundle.node.name.value] ?? new Set()

    if (expansions !== undefined) {
      bundle.expansions = [
        ...bundle.expansions,
        // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
        ...[...expansions].map((type) => context.shared[type]!),
      ]
    }
  }

  document.globals.push(...(schemaGlobals as DefinitionNode[]))

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

  const typeWhereInput = invoke(function registerTypeWhereInput(
    // oxlint-disable-next-line eslint-plugin-unicorn/no-object-as-default-parameter
    args = { node },
  ) {
    const { node } = args
    const typeWhereInput = `${node.name.value}WhereInput`
    const followups: (() => void)[] = []

    context.shared[typeWhereInput] ??= {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: typeWhereInput,
      },
      fields: [
        ...(node.fields ?? []).flatMap<InputValueDefinitionNode>((field) => {
          const fieldType = invoke(function getFieldType(
            fieldType = field.type,
          ) {
            if (fieldType.kind === Kind.NAMED_TYPE) {
              const supportedScalars = [
                'ID',
                'Boolean',
                'Int',
                'Float',
                'String',
                'DateTime',
              ]

              if (supportedScalars.includes(fieldType.name.value)) {
                return `${fieldType.name.value}FilterInput`
              }

              const relatedObjectTypeNode = document.bundles.find(
                (
                  bundle,
                ): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                  bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                  bundle.node.name.value === fieldType.name.value,
              )?.node

              if (relatedObjectTypeNode !== undefined) {
                followups.push(() => {
                  let relationFieldType!: string

                  if (
                    context.shared[
                      `${relatedObjectTypeNode.name.value}WhereInput`
                    ] === undefined
                  ) {
                    relationFieldType = registerTypeWhereInput({
                      node: relatedObjectTypeNode,
                    })
                  }

                  context.grouped[relatedObjectTypeNode.name.value] ??=
                    new Set()

                  context.grouped[relatedObjectTypeNode.name.value]?.add(
                    relationFieldType,
                  )

                  context.shared[
                    `${relatedObjectTypeNode.name.value}RelationFilterInput`
                  ] ??= invoke(() => {
                    const relationInput = structuredClone(
                      // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
                      context.shared[relationFieldType]!,
                    ) as Mutable<InputObjectTypeDefinitionNode>

                    relationInput.name.value = `${relatedObjectTypeNode.name.value}RelationFilterInput`

                    return relationInput as DefinitionNode
                  })

                  context.grouped[relatedObjectTypeNode.name.value]?.add(
                    `${relatedObjectTypeNode.name.value}RelationFilterInput`,
                  )
                })

                return `${relatedObjectTypeNode.name.value}RelationFilterInput`
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
                const relatedObjectTypeNode = document.bundles.find(
                  (
                    bundle,
                  ): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                    bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                    bundle.node.name.value === nestedFieldType,
                )?.node

                if (relatedObjectTypeNode !== undefined) {
                  followups.push(() => {
                    const relatedFieldType = `${relatedObjectTypeNode.name.value}WhereInput`

                    if (
                      context.shared[
                        `${relatedObjectTypeNode.name.value}WhereInput`
                      ] === undefined
                    ) {
                      registerTypeWhereInput({
                        node: relatedObjectTypeNode,
                      })
                    }

                    context.grouped[relatedObjectTypeNode.name.value] ??=
                      new Set()
                    context.grouped[relatedObjectTypeNode.name.value]?.add(
                      relatedFieldType,
                    )

                    context.shared[
                      `${relatedObjectTypeNode.name.value}ListRelationFilterInput`
                    ] ??= {
                      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
                      name: {
                        kind: Kind.NAME,
                        value: `${relatedObjectTypeNode.name.value}ListRelationFilterInput`,
                      },
                      fields: ['some', 'every', 'none'].map((field) => ({
                        kind: Kind.INPUT_VALUE_DEFINITION,
                        name: { kind: Kind.NAME, value: field },
                        type: {
                          kind: Kind.NAMED_TYPE,
                          name: { kind: Kind.NAME, value: relatedFieldType },
                        },
                      })),
                    }

                    context.grouped[relatedObjectTypeNode.name.value]?.add(
                      `${relatedObjectTypeNode.name.value}ListRelationFilterInput`,
                    )
                  })

                  return `${relatedObjectTypeNode.name.value}ListRelationFilterInput`
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
        ...['OR', 'AND'].map<InputValueDefinitionNode>((field) => ({
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
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'NOT',
          },
          type: {
            kind: Kind.LIST_TYPE,
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: `${node.name.value}WhereNotInput`,
                },
              },
            },
          },
        },
      ],
    }

    context.grouped[node.name.value] ??= new Set()
    context.grouped[node.name.value]?.add(typeWhereInput)

    context.shared[`${node.name.value}WhereNotInput`] ??= invoke(() => {
      const relationInput = structuredClone(
        // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
        context.shared[typeWhereInput]!,
      ) as Mutable<InputObjectTypeDefinitionNode>

      relationInput.name.value = `${node.name.value}WhereNotInput`
      relationInput.fields = relationInput.fields?.filter(
        (field) => field.name.value !== 'NOT',
      )

      return relationInput as DefinitionNode
    })

    context.grouped[node.name.value]?.add(`${node.name.value}WhereNotInput`)

    for (const followup of followups) {
      followup()
    }

    return typeWhereInput
  })

  // oxlint-disable-next-line eslint-plugin-unicorn/no-object-as-default-parameter
  invoke(function registerOrderByInput(args = { node }) {
    const { node } = args
    const typeOrderByInput = `${node.name.value}OrderByInput`
    const followups: (() => void)[] = []

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

            const relatedObjectTypeNode = document.bundles.find(
              (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
                bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                bundle.node.name.value === fieldType.name.value,
            )?.node

            if (relatedObjectTypeNode !== undefined) {
              if (relatedObjectTypeNode !== undefined) {
                followups.push(() => {
                  let relationFieldType!: string

                  if (
                    context.shared[
                      `${relatedObjectTypeNode.name.value}OrderByInput`
                    ] === undefined
                  ) {
                    relationFieldType = registerOrderByInput({
                      node: relatedObjectTypeNode,
                    })
                  }

                  context.grouped[relatedObjectTypeNode.name.value] ??=
                    new Set()
                  context.grouped[relatedObjectTypeNode.name.value]?.add(
                    relationFieldType,
                  )
                })

                return `${relatedObjectTypeNode.name.value}OrderByInput`
              }

              return `${relatedObjectTypeNode}OrderByInput`
            }

            return `SortOrderInput`
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

    context.grouped[node.name.value] ??= new Set()
    context.grouped[node.name.value]?.add(typeOrderByInput)

    for (const followup of followups) {
      followup()
    }

    return typeOrderByInput
  })

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
                  value: `${node.name.value}ListInput`,
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
        value: `${node.name.value}ListInput`,
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
  )
}
