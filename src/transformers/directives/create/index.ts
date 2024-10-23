import type { Bundle, Document } from '#app/document.js'
import {
  Kind,
  type InputObjectTypeDefinitionNode,
  type NonNullTypeNode,
  type ObjectTypeDefinitionNode,
  type TypeNode,
} from 'graphql'

export default function (bundle: Bundle, document: Document) {
  const { node } = bundle

  if (
    node.kind !== Kind.OBJECT_TYPE_DEFINITION ||
    node.directives?.some(({ name }) => name.value === 'create') !== true
  ) {
    return
  }

  addMutation(node, bundle)
  addMutationInput(node, bundle, document)
  addMutationOutput(node, bundle)
  addMutationResult(node, bundle)
  addMutationValidation(node, bundle)
  addMutationValidationIssues(node, bundle)
  addGlobals(document)
}

function addMutation(node: ObjectTypeDefinitionNode, bundle: Bundle) {
  bundle.expansions?.push({
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
          value: `create${node.name.value}`,
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
                  value: `Create${node.name.value}Input`,
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
              value: `Create${node.name.value}Output`,
            },
          },
        },
      },
    ],
  })
}

function addMutationInput(
  node: ObjectTypeDefinitionNode,
  bundle: Bundle,
  document: Document,
) {
  // TODO embed these to document
  // {
  const objectTypeMap = Object.fromEntries(
    document.bundles.flatMap((bundle) => {
      const { node } = bundle

      if (node.kind === Kind.OBJECT_TYPE_DEFINITION) {
        return [[node.name.value, node]]
      }

      return []
    }),
  )
  const objectTypeNames = Object.keys(objectTypeMap)
  // }

  const relationInputRegistry: Record<string, string> = {}

  bundle.expansions.push({
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}Input`,
    },
    fields: node.fields?.flatMap((field) => {
      const type = (function getType(
        type: TypeNode = field.type,
        wrapType: (type: TypeNode) => TypeNode = (type) => type,
      ): TypeNode | undefined {
        if (field.directives?.some(({ name }) => name.value === 'readonly')) {
          return
        }

        if (type.kind === Kind.NON_NULL_TYPE) {
          const result = getType(type.type, (type) => ({
            kind: Kind.NON_NULL_TYPE,
            type: type as NonNullTypeNode['type'],
          }))

          if (result == null) {
            return
          }

          return wrapType(result)
        }

        if (type.kind === Kind.LIST_TYPE) {
          const result = getType(type.type, (type) => ({
            kind: Kind.LIST_TYPE,
            type,
          }))

          if (result == null) {
            return
          }

          return wrapType(result)
        }

        if (type.kind === Kind.NAMED_TYPE) {
          if (type.name.value === 'ID') {
            return
          }

          if (objectTypeNames.includes(type.name.value)) {
            const typeName = `Create${node.name.value}${type.name.value}RelationInput`
            relationInputRegistry[typeName] = typeName

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
      })()

      if (type == null) {
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
  })

  bundle.expansions.push(
    ...Object.keys(relationInputRegistry).map<InputObjectTypeDefinitionNode>(
      (name) => {
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
        }
      },
    ),
  )
}

function addMutationOutput(node: ObjectTypeDefinitionNode, bundle: Bundle) {
  bundle.expansions.push({
    kind: Kind.UNION_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}Output`,
    },
    directives: [
      {
        kind: Kind.DIRECTIVE,
        name: {
          kind: Kind.NAME,
          value: 'exclusive',
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
              value: `Create${node.name.value}Result`,
            },
          },
          {
            kind: Kind.ARGUMENT,
            name: {
              kind: Kind.NAME,
              value: 'field',
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
          value: 'exclusive',
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
              value: `Create${node.name.value}Validation`,
            },
          },
          {
            kind: Kind.ARGUMENT,
            name: {
              kind: Kind.NAME,
              value: 'field',
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
          value: `Create${node.name.value}Result`,
        },
      },
      {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: `Create${node.name.value}Validation`,
        },
      },
    ],
  })
}

function addMutationResult(node: ObjectTypeDefinitionNode, bundle: Bundle) {
  bundle.expansions.push({
    kind: Kind.OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}Result`,
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
  })
}

function addMutationValidation(node: ObjectTypeDefinitionNode, bundle: Bundle) {
  bundle.expansions.push({
    kind: Kind.OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}Validation`,
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
              value: `Create${node.name.value}ValidationIssues`,
            },
          },
        },
      },
    ],
  })
}

function addMutationValidationIssues(
  node: ObjectTypeDefinitionNode,
  bundle: Bundle,
) {
  bundle.expansions.push({
    kind: Kind.SCALAR_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}ValidationIssues`,
    },
  })
}

function addGlobals(document: Document) {
  document.globals.push({
    kind: Kind.DIRECTIVE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: 'exclusive',
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
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'String',
          },
        },
      },
      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: 'field',
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'String',
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
  })
}
