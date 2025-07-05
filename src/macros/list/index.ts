import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import { groupedGlobals } from './globals.js'
import type { InputValueDefinitionNode } from 'graphql'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import type { Mutable } from '#package/utils/mutable.js'
import type { NamedTypeNode } from 'graphql'
import type { ObjectTypeDefinitionNode } from 'graphql'
import { parse } from 'graphql'
import { printSchema } from 'graphql'
import { GraphQLSchema as Schema } from 'graphql'
import type { StringValueNode } from 'graphql'

interface Context {
  shared: Record<string, DefinitionNode>
  grouped: Record<string, Set<string>>
  objectTypeBundles: (Bundle & {
    node: ObjectTypeDefinitionNode
  })[]
  globals: Set<string>
}

export default (document: Document) => {
  const bundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
      bundle.node.directives?.find(
        (directive) => directive.name.value === 'list',
      ) !== undefined,
  )

  const objectTypeBundles = document.bundles.filter(
    (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION,
  )

  const context: Context = {
    shared: {},
    grouped: {},
    objectTypeBundles,
    globals: new Set(),
  }

  for (const bundle of bundles) {
    const expansions = addMutation(
      bundle.node,
      document,
      context,
    ) as DefinitionNode[]
    // eslint-disable-next-line dot-notation
    bundle.groupedExpansions['list'] = [
      // eslint-disable-next-line dot-notation
      ...(bundle.groupedExpansions['list'] ?? []),
      ...expansions,
    ]
  }

  for (const bundle of objectTypeBundles) {
    const node = bundle.node as Mutable<typeof bundle.node>

    node.fields = node.fields?.map((field) => {
      if (
        !field.directives?.find(
          (directive) => directive.name.value === 'relatedList',
        )
      ) {
        return field
      }

      // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
      if (field.arguments !== undefined && field.arguments.length > 0) {
        return field
      }

      let fieldType = field.type

      if (fieldType.kind === Kind.NON_NULL_TYPE) {
        fieldType = fieldType.type
      }

      if (!(fieldType.kind === Kind.LIST_TYPE)) {
        return field
      }

      fieldType = fieldType.type

      if (fieldType.kind === Kind.NON_NULL_TYPE) {
        fieldType = fieldType.type
      }

      if (!(fieldType.kind === Kind.NAMED_TYPE)) {
        return field
      }

      const relatedObjectType = objectTypeBundles.find(
        (bundle) => bundle.node.name.value === fieldType.name.value,
      )

      if (!(relatedObjectType !== undefined)) {
        return field
      }

      field.arguments = [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: { kind: Kind.NAME, value: 'input' },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: `${fieldType.name.value}ListInput`,
            },
          },
        },
      ]

      createListInput(relatedObjectType.node, document, context)

      return field
    })
  }

  for (const bundle of objectTypeBundles) {
    const groupedExpansions =
      context.grouped[bundle.node.name.value] ?? new Set()

    const expansions = [...groupedExpansions].flatMap(
      // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
      (type) => context.shared[type]!,
    )

    if (expansions.length > 0 && !bundle.directives.includes('list')) {
      bundle.directives.push('list')
    }

    // eslint-disable-next-line dot-notation
    bundle.groupedExpansions['list'] = [
      // eslint-disable-next-line dot-notation
      ...(bundle.groupedExpansions['list'] ?? []),
      ...expansions,
    ]
  }

  const globalsOrder = Object.entries([
    'IDFilterInput',
    'StringFilterInput',
    'FloatFilterInput',
    'IntFilterInput',
    'BooleanFilterInput',
    'DateTimeFilterInput',
    'SortOrderInput',
    'OrderByRelationAggregateInput',
  ]).reduce<Record<string, string>>((result, [key, value]) => {
    result[value] = key

    return result
  }, {})

  const customGlobals = [...context.globals]
    .sort((left, right) =>
      // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
      globalsOrder[left]!.localeCompare(globalsOrder[right]!),
    )
    .flatMap((type) =>
      invoke(() => {
        let x

        // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
        x = new Schema({ types: [groupedGlobals[type]!] })
        x = printSchema(x)
        x = parse(x)
        x = x.definitions

        if (type === 'DateTimeFilterInput') {
          x = x.filter(
            (definition) =>
              !(
                definition.kind === Kind.SCALAR_TYPE_DEFINITION &&
                definition.name.value === 'DateTime'
              ),
          )
        }

        return x
      }),
    )

  document.globals.push(...customGlobals)

  return document
}

function addMutation(
  node: ObjectTypeDefinitionNode,
  document: Document,
  context: Context,
) {
  const fieldName = node.directives
    ?.find((directive) => directive.name.value === 'list')
    ?.arguments?.find(
      (argument): argument is typeof argument & { value: StringValueNode } =>
        argument.name.value === 'field' && argument.value.kind === Kind.STRING,
    )?.value.value

  if (!(typeof fieldName === 'string')) {
    throw new Error(
      `Directive "@list" argument "field" must be of type "String".`,
    )
  }

  // oxlint-disable-next-line eslint-plugin-unicorn(explicit-length-check)
  if (!(fieldName.length > 0)) {
    throw new Error(`Directive "@list" argument "field" must be non-empty.`)
  }

  createListInput(node, document, context)

  return [
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
  ]
}

function createListInput(
  node: ObjectTypeDefinitionNode,
  document: Document,
  context: Context,
) {
  context.grouped[node.name.value] ??= new Set()
  context.grouped[node.name.value]?.add(`${node.name.value}ListInput`)
  context.shared[`${node.name.value}ListInput`] = {
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
          value: 'where',
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${node.name.value}WhereInput`,
          },
        },
      },

      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: 'cursor',
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${node.name.value}CursorInput`,
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
          value: 'skip',
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'Int',
          },
        },
      },
    ],
  }

  invoke(function registerTypeWhereInput(
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
        // oxlint-disable-next-line typescript-eslint/no-non-null-assertion
        ...node.fields!.flatMap<InputValueDefinitionNode>((field) => {
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
                context.globals.add(`${fieldType.name.value}FilterInput`)

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
                })

                return `${relatedObjectTypeNode.name.value}WhereInput`
              }
            }

            if (fieldType.kind === Kind.LIST_TYPE) {
              const nestedFieldType = invoke(
                (nestedFieldType = fieldType.type) => {
                  let x = nestedFieldType

                  if (x.kind === Kind.NON_NULL_TYPE) {
                    x = x.type
                  }

                  if (!(x.kind === Kind.NAMED_TYPE)) {
                    return
                  }

                  // if (
                  //   !context.objectTypeBundles.some(
                  //     (bundle) => bundle.node.name.value === x.name.value,
                  //   )
                  // ) {
                  //   return
                  // }

                  return x.name.value
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

                return
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

    context.grouped[node.name.value] ??= new Set()
    context.grouped[node.name.value]?.add(typeWhereInput)

    for (const followup of followups) {
      followup()
    }

    return typeWhereInput
  })

  {
    context.grouped[node.name.value]?.add(`${node.name.value}CursorInput`)
    context.shared[`${node.name.value}CursorInput`] = {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: { kind: Kind.NAME, value: `${node.name.value}CursorInput` },
      fields: node.fields?.flatMap((field) => {
        let fieldType = field.type

        if (fieldType.kind === Kind.NON_NULL_TYPE) {
          fieldType = fieldType.type
        }

        if (fieldType.kind === Kind.LIST_TYPE) {
          return []
        }

        if (
          context.objectTypeBundles.some(
            (bundle) => bundle.node.name.value === fieldType.name.value,
          )
        ) {
          return []
        }

        return [
          {
            kind: Kind.INPUT_VALUE_DEFINITION,
            name: { kind: Kind.NAME, value: field.name.value },
            type: invoke(() => {
              const type: NamedTypeNode = {
                kind: Kind.NAMED_TYPE,
                name: { kind: Kind.NAME, value: fieldType.name.value },
              }

              if (field.name.value === 'id') {
                return {
                  kind: Kind.NON_NULL_TYPE,
                  type,
                }
              }

              return type
            }),
          },
        ]
      }),
    }
  }

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
      // oxlint-disable-next-line typescript-eslint(no-non-null-assertion)
      fields: node.fields!.flatMap<InputValueDefinitionNode>((field) => {
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

            // if (relatedObjectTypeNode !== undefined) {
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

                context.grouped[relatedObjectTypeNode.name.value] ??= new Set()
                context.grouped[relatedObjectTypeNode.name.value]?.add(
                  relationFieldType,
                )
              })

              return `${relatedObjectTypeNode.name.value}OrderByInput`
            }

            //   return `${relatedObjectTypeNode}OrderByInput`
            // }

            context.globals.add(`SortOrderInput`)

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
                ): bundle is Bundle & {
                  node: ObjectTypeDefinitionNode
                } =>
                  bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
                  bundle.node.name.value === nestedFieldType,
              )?.node.name.value

              if (relatedObjectType !== undefined) {
                context.globals.add(`OrderByRelationAggregateInput`)

                return `OrderByRelationAggregateInput`
              }

              return
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
}
