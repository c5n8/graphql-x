import type { Bundle, Document } from '#app/document.js'
import {
  Kind,
  type InputObjectTypeDefinitionNode,
  type ListTypeNode,
  type NamedTypeNode,
  type ObjectTypeDefinitionNode,
  type TypeNode,
} from 'graphql'

export default function (bundle: Bundle, document: Document) {
  const { node } = bundle

  if (
    node.kind === Kind.OBJECT_TYPE_DEFINITION &&
    node.directives?.some((directive) => directive.name.value === 'create')
  ) {
    // valid
  } else return

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
      const getType = (
        fieldType: TypeNode,
        wrapType: (type: NamedTypeNode | ListTypeNode) => TypeNode = (type) =>
          type,
      ): TypeNode | undefined => {
        if (fieldType.kind === Kind.NAMED_TYPE) {
          if (
            fieldType.name.value !== 'ID' &&
            field.directives?.some(
              (directive) => directive.name.value === 'readonly',
            ) !== true
          ) {
            // valid
          } else {
            return
          }

          if (objectTypeNames.includes(fieldType.name.value)) {
            const typeName = `Create${node.name.value}${fieldType.name.value}RelationInput`
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
              value: fieldType.name.value,
            },
          })
        }

        if (fieldType.kind === Kind.LIST_TYPE) {
          const type =
            fieldType.type.kind === Kind.NON_NULL_TYPE
              ? getType(fieldType.type.type, (type) => ({
                  kind: Kind.NON_NULL_TYPE,
                  type,
                }))
              : getType(fieldType.type)

          if (type == null) {
            return
          }

          return wrapType({
            kind: Kind.LIST_TYPE,
            type,
          })
        }
      }

      const type =
        field.type.kind === Kind.NON_NULL_TYPE
          ? getType(field.type.type, (type) => ({
              kind: Kind.NON_NULL_TYPE,
              type,
            }))
          : getType(field.type)

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
        directives: [
          {
            kind: Kind.DIRECTIVE,
            name: {
              kind: Kind.NAME,
              value: 'exclusive',
            },
          },
        ],
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
        directives: [
          {
            kind: Kind.DIRECTIVE,
            name: {
              kind: Kind.NAME,
              value: 'exclusive',
            },
          },
        ],
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
    repeatable: false,
    locations: [
      {
        kind: Kind.NAME,
        value: 'FIELD_DEFINITION',
      },
    ],
  })
}
