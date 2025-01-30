import type { Bundle } from '#package/document.js'
import type { DefinitionNode } from 'graphql'
import type { Document } from '#package/document.js'
import type { InputObjectTypeDefinitionNode } from 'graphql'
import type { InputValueDefinitionNode } from 'graphql'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import type { ObjectTypeDefinitionNode } from 'graphql'
import type { TypeNode } from 'graphql'

const operations = ['create', 'update'] as const

const operationNames = {
  create: 'Create',
  update: 'Update',
}

interface Context {
  operationName: {
    uppercase: string
    lowercase: string
  }
  objectTypeMap: Map<string, ObjectTypeDefinitionNode>
  objectTypeNameSet: Set<string>
}

export function writeDirectiveExpansion(
  operation: (typeof operations)[number],
) {
  return function (document: Document) {
    const objectTypeMap = document.bundles.reduce((map, bundle) => {
      const { node } = bundle

      if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
        map.set(node.name.value, node)
      }

      return map
    }, new Map())
    const objectTypeNameSet = new Set(objectTypeMap.keys())
    const context = {
      operationName: {
        uppercase: operationNames[operation],
        lowercase: operation,
      },
      objectTypeNameSet,
      objectTypeMap,
    }

    const bundles = document.bundles.filter(
      (bundle): bundle is Bundle & { node: ObjectTypeDefinitionNode } =>
        bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
        bundle.node.directives !== undefined &&
        bundle.node.directives.some(
          ({ name }) => name.value === `${context.operationName.lowercase}`,
        ),
    )

    for (const bundle of bundles) {
      const { node } = bundle

      const expansions = invoke(() => {
        let x

        x = [
          addMutation,
          addMutationInput,
          addMutationOutput,
          addMutationResult,
          addMutationValidation,
          addMutationValidationIssues,
        ]

        x = x.reduce<DefinitionNode[]>((result, fn) => {
          result.push(...(fn(context, node) as DefinitionNode[]))

          return result
        }, [])

        return x
      })

      bundle.groupedExpansions[operation] = expansions
    }

    if (bundles.length > 0) {
      document.globals.push(...(addGlobals() as DefinitionNode[]))
    }

    return document
  }
}

function addMutation(context: Context, node: ObjectTypeDefinitionNode) {
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
            value: `${context.operationName.lowercase}${node.name.value}`,
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
                    value: `${context.operationName.uppercase}${node.name.value}Input`,
                  },
                },
              },
            },
          ],
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: `${context.operationName.uppercase}${node.name.value}Output`,
              },
            },
          },
        },
      ],
    },
  ]
}

function addMutationInput(context: Context, node: ObjectTypeDefinitionNode) {
  // TODO embed these to document
  const { objectTypeNameSet, operationName } = context

  const relationInputSet = new Set<string>()
  const relationInputMap = new Map<string, ObjectTypeDefinitionNode>()

  return [
    {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${operationName.uppercase}${node.name.value}Input`,
      },
      fields: [
        ...invoke((): InputValueDefinitionNode[] => {
          if (!(operationName.lowercase === 'update')) {
            return []
          }

          // oxlint-disable-next-line typescript-eslint(no-non-null-assertion)
          const idFields = node.fields!.filter((field) => {
            let { type } = field

            if (type.kind === Kind.NON_NULL_TYPE) {
              // eslint-disable-next-line prefer-destructuring
              type = type.type
            }

            return type.kind === Kind.NAMED_TYPE && type.name.value === 'ID'
          })

          if (!(idFields.length === 1 && idFields[0] !== undefined)) {
            throw new Error(
              'Type with directive "@update" should have exactly one field of type ID.',
            )
          }

          return [
            {
              kind: Kind.INPUT_VALUE_DEFINITION,
              name: { kind: Kind.NAME, value: idFields[0]?.name.value },
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
          ]
        }),

        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: { kind: Kind.NAME, value: 'data' },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: `${operationName.uppercase}${node.name.value}DataInput`,
            },
          },
        },

        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: { kind: Kind.NAME, value: 'dryRun' },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: 'Boolean',
            },
          },
        },
      ],
    },

    {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${operationName.uppercase}${node.name.value}DataInput`,
      },
      fields: node.fields?.flatMap((field) => {
        if (field.directives?.some(({ name }) => name.value === 'readonly')) {
          return []
        }

        const type = invoke(function getType(
          type = field.type,
          wrapType = (type: TypeNode) => type,
        ): TypeNode | undefined {
          if (type.kind === Kind.NON_NULL_TYPE) {
            const result = getType(type.type)

            if (result === undefined) {
              return
            }

            return wrapType(result)
          }

          if (type.kind === Kind.LIST_TYPE) {
            const result = getType(type.type, (type) => ({
              kind: Kind.LIST_TYPE,
              type,
            }))

            if (result === undefined) {
              return
            }

            return wrapType(result)
          }

          if (type.kind === Kind.NAMED_TYPE) {
            if (type.name.value === 'ID') {
              return
            }

            if (objectTypeNameSet.has(type.name.value)) {
              const typeName = `${operationName.uppercase}${node.name.value}${type.name.value}RelationInput`

              relationInputSet.add(typeName)
              relationInputMap.set(
                typeName,
                // oxlint-disable-next-line typescript-eslint(no-non-null-assertion)
                context.objectTypeMap.get(type.name.value)!,
              )

              return wrapType({
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: typeName,
                },
              })
            }

            return wrapType({
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: type.name.value,
              },
            })
          }
        })

        if (type === undefined) {
          return []
        }

        return [
          {
            kind: Kind.INPUT_VALUE_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: field.name.value,
            },
            type,
          },
        ]
      }),
    },
    ...[...relationInputSet].map<InputObjectTypeDefinitionNode>((name) => {
      // oxlint-disable-next-line typescript-eslint(no-non-null-assertion)
      const idFields = relationInputMap.get(name)!.fields!.filter((field) => {
        let { type } = field

        if (type.kind === Kind.NON_NULL_TYPE) {
          // eslint-disable-next-line prefer-destructuring
          type = type.type
        }

        return type.kind === Kind.NAMED_TYPE && type.name.value === 'ID'
      })

      if (!(idFields.length === 1 && idFields[0] !== undefined)) {
        throw new Error(
          'Type used as type of a field of another type with directive "@create" "@update" should have exactly one field of type ID.',
        )
      }

      return {
        kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: name,
        },
        fields: [
          {
            kind: Kind.INPUT_VALUE_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: idFields[0].name.value,
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
      }
    }),
  ]
}

function addMutationOutput(context: Context, node: ObjectTypeDefinitionNode) {
  return [
    {
      kind: Kind.UNION_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${context.operationName.uppercase}${node.name.value}Output`,
      },
      directives: [
        {
          kind: Kind.DIRECTIVE,
          name: {
            kind: Kind.NAME,
            value: 'signature',
          },
          arguments: [
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'fields',
              },
              value: {
                kind: Kind.LIST,
                values: [
                  {
                    kind: Kind.STRING,
                    value: 'issues',
                  },
                  {
                    kind: Kind.STRING,
                    value: 'result',
                  },
                ],
              },
            },
          ],
        },
        {
          kind: Kind.DIRECTIVE,
          name: {
            kind: Kind.NAME,
            value: 'member',
          },
          arguments: [
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'type',
              },
              value: {
                kind: Kind.STRING,
                value: `${context.operationName.uppercase}${node.name.value}Result`,
              },
            },
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'signature',
              },
              value: {
                kind: Kind.STRING,
                value: 'result',
              },
            },
          ],
        },
        {
          kind: Kind.DIRECTIVE,
          name: {
            kind: Kind.NAME,
            value: 'member',
          },
          arguments: [
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'type',
              },
              value: {
                kind: Kind.STRING,
                value: `${context.operationName.uppercase}${node.name.value}Validation`,
              },
            },
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'signature',
              },
              value: {
                kind: Kind.STRING,
                value: 'issues',
              },
            },
          ],
        },
      ],
      types: [
        {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${context.operationName.uppercase}${node.name.value}Result`,
          },
        },
        {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${context.operationName.uppercase}${node.name.value}Validation`,
          },
        },
      ],
    },
  ]
}

function addMutationResult(context: Context, node: ObjectTypeDefinitionNode) {
  return [
    {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${context.operationName.uppercase}${node.name.value}Result`,
      },
      fields: [
        {
          kind: Kind.FIELD_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'result',
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: node.name.value,
              },
            },
          },
        },
      ],
    },
  ]
}

function addMutationValidation(
  context: Context,
  node: ObjectTypeDefinitionNode,
) {
  return [
    {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${context.operationName.uppercase}${node.name.value}Validation`,
      },
      fields: [
        {
          kind: Kind.FIELD_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'issues',
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: `${context.operationName.uppercase}${node.name.value}ValidationIssues`,
              },
            },
          },
        },
      ],
    },
  ]
}

function addMutationValidationIssues(
  context: Context,
  node: ObjectTypeDefinitionNode,
) {
  return [
    {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `${context.operationName.uppercase}${node.name.value}ValidationIssues`,
      },
      directives: [
        {
          kind: Kind.DIRECTIVE,
          name: {
            kind: Kind.NAME,
            value: 'issues',
          },
          arguments: [
            {
              kind: Kind.ARGUMENT,
              name: {
                kind: Kind.NAME,
                value: 'input',
              },
              value: {
                kind: Kind.STRING,
                value: `${context.operationName.uppercase}${node.name.value}Input`,
              },
            },
          ],
        },
      ],
    },
  ]
}

function addGlobals() {
  return [
    {
      kind: Kind.DIRECTIVE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: 'signature',
      },
      repeatable: false,
      arguments: [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'fields',
          },
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
                    value: 'String',
                  },
                },
              },
            },
          },
        },
      ],
      locations: [
        {
          kind: Kind.NAME,
          value: 'UNION',
        },
      ],
    },
    {
      kind: Kind.DIRECTIVE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: 'member',
      },
      repeatable: true,
      arguments: [
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'type',
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: 'String',
              },
            },
          },
        },
        {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: 'signature',
          },
          type: {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: 'String',
              },
            },
          },
        },
      ],
      locations: [
        {
          kind: Kind.NAME,
          value: 'UNION',
        },
      ],
    },
    {
      kind: Kind.DIRECTIVE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: 'issues',
      },
      repeatable: false,
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
                value: 'String',
              },
            },
          },
        },
      ],
      locations: [
        {
          kind: Kind.NAME,
          value: 'SCALAR',
        },
      ],
    },
  ]
}
