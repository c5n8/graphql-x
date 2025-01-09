export const schemaGlobals = [
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'IDFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'ID',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'ID',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'IDNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'IDNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'ID',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'ID',
              },
            },
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'StringFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'contains',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'startsWith',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'endsWith',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'mode',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'QueryMode',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'StringNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'StringNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'contains',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'startsWith',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'endsWith',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'mode',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'QueryMode',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'FloatFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Float',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'FloatNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'FloatNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Float',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Float',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'IntFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Int',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'IntNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'IntNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Int',
              },
            },
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'BooleanFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Boolean',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'BooleanNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'BooleanNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Boolean',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'DateTimeFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'notIn',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'not',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTimeNotFilterInput',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'DateTimeNotFilterInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'equals',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'in',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'notIn',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'lte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gt',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'gte',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'DateTime',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'SortOrderInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'sort',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'SortOrder',
          },
        },
      },
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: 'nulls',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'NullsOrder',
          },
        },
      },
    ],
  },
  {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'OrderByRelationAggregateInput',
    },
    fields: [
      {
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: '_count',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'SortOrder',
          },
        },
      },
    ],
  },
  {
    kind: 'ScalarTypeDefinition',
    name: {
      kind: 'Name',
      value: 'QueryMode',
    },
  },
  {
    kind: 'ScalarTypeDefinition',
    name: {
      kind: 'Name',
      value: 'SortOrder',
    },
  },
  {
    kind: 'ScalarTypeDefinition',
    name: {
      kind: 'Name',
      value: 'NullsOrder',
    },
  },
]
