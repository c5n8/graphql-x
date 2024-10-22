import type { Bundle, Document } from '#app/document.js'
import {
  Kind,
  type FieldDefinitionNode,
  type InputObjectTypeDefinitionNode,
  type NamedTypeNode,
  type ObjectTypeDefinitionNode,
  type TypeNode,
} from 'graphql'

export default function (bundle: Bundle, document: Document): Bundle {
  const { node } = bundle

  if (
    node.kind === Kind.OBJECT_TYPE_DEFINITION &&
    node.directives?.some((directive) => directive.name.value === 'create')
  ) {
    // valid
  } else return bundle

  addMutation(node, bundle)
  addMutationInput(node, bundle, document)
  addMutationOutput(node, bundle)
  addMutationResult(node, bundle)
  addMutationValidation(node, bundle)
  addMutationValidationIssues(node, bundle)

  return bundle
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
  // TODO embed these to document  {
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

  const relationInputNames: string[] = []

  bundle.expansions.push({
    kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: {
      kind: Kind.NAME,
      value: `Create${node.name.value}Input`,
    },
    fields: node.fields?.flatMap((field) => {
      function getType(
        field: FieldDefinitionNode,
        fieldType: TypeNode,
        createType: (type: NamedTypeNode) => TypeNode = (type) => type,
      ) {
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
            relationInputNames.push(typeName)

            return createType({
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: typeName,
              },
            })
          }

          return createType({
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: fieldType.name.value,
            },
          })
        }
      }

      const type =
        field.type.kind === Kind.NON_NULL_TYPE
          ? getType(field, field.type.type, (type) => ({
              kind: Kind.NON_NULL_TYPE,
              type,
            }))
          : getType(field, field.type)

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
    ...relationInputNames.map<InputObjectTypeDefinitionNode>((name) => {
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
    }),
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
