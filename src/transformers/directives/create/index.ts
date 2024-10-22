import type { Bundle, Document } from '#app/document.js'
import {
  Kind,
  type InputObjectTypeDefinitionNode,
  type ObjectTypeDefinitionNode,
  type TypeNode,
} from 'graphql'

export default function (bundle: Bundle, document: Document): Bundle {
  if (
    !(
      bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
      bundle.node.directives?.some(
        (directive) => directive.name.value === 'create',
      )
    )
  ) {
    return bundle
  }

  const { node } = bundle

  addMutation(node, bundle)
  addMutationInput(node, bundle, document)
  addMutationOutput(node, bundle)

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
      let type: TypeNode | undefined

      if (
        field.type.kind === Kind.NON_NULL_TYPE &&
        field.type.type.kind === Kind.NAMED_TYPE
      ) {
        if (field.type.type.name.value === 'ID') {
          return []
        }

        if (
          field.directives?.some(
            (directive) => directive.name.value === 'readonly',
          )
        ) {
          return []
        }

        if (objectTypeNames.includes(field.type.type.name.value)) {
          const typeName = `Create${node.name.value}${field.type.type.name.value}RelationInput`
          relationInputNames.push(typeName)

          type = {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: typeName,
              },
            },
          }
        } else {
          type = {
            kind: Kind.NON_NULL_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: field.type.type.name.value,
              },
            },
          }
        }
      } else if (field.type.kind === Kind.NAMED_TYPE) {
        if (field.type.name.value === 'ID') {
          return []
        }

        if (
          field.directives?.some(
            (directive) => directive.name.value === 'readonly',
          )
        ) {
          return []
        }

        if (objectTypeNames.includes(field.type.name.value)) {
          const typeName = `Create${node.name.value}${field.type.name.value}RelationInput`
          relationInputNames.push(typeName)

          type = {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: typeName,
            },
          }
        } else {
          type = {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: field.type.name.value,
            },
          }
        }
      }

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
  bundle.expansions.push(
    {
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
    },

    // Mutation Result
    {
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
    },

    // Mutation Input Validation
    {
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
    },

    // Mutation Input Validation Issues
    {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: `Create${node.name.value}ValidationIssues`,
      },
    },
  )
}
