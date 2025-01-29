import { GraphQLBoolean as BooleanScalar } from 'graphql'
import { define } from '@txe/define-x'
import { GraphQLFloat as Float } from 'graphql'
import { GraphQLID as ID } from 'graphql'
import { GraphQLInt as Int } from 'graphql'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import { GraphQLList as List } from 'graphql'
import { GraphQLNonNull as NonNull } from 'graphql'
import { GraphQLInputObjectType as ObjectType } from 'graphql'
import { parse } from 'graphql'
import { printSchema } from 'graphql'
import { GraphQLScalarType as Scalar } from 'graphql'
import { GraphQLSchema as Schema } from 'graphql'
import { GraphQLString as StringScalar } from 'graphql'

const types: Record<string, ObjectType> = invoke(() => {
  let x

  // oxlint-disable typescript-eslint/no-non-null-assertion
  x = define<Record<string, (name: string) => ObjectType>>({
    IDFilterInput: (name) =>
      new ObjectType({
        name,
        fields: () => ({
          equals: { type: ID },
          in: { type: new List(new NonNull(ID)) },
          not: { type: types[name]! },
        }),
      }),

    StringFilterInput: (name) =>
      new ObjectType({
        name,
        fields: () => ({
          equals: { type: StringScalar },
          in: { type: new List(new NonNull(StringScalar)) },
          lt: { type: StringScalar },
          lte: { type: StringScalar },
          gt: { type: StringScalar },
          gte: { type: StringScalar },
          contains: { type: StringScalar },
          startsWith: { type: StringScalar },
          endsWith: { type: StringScalar },
          mode: { type: new Scalar({ name: 'QueryMode' }) },
          not: { type: types[name]! },
        }),
      }),

    FloatFilterInput: (name) =>
      new ObjectType({
        name,
        fields: () => ({
          equals: { type: Float },
          in: { type: new List(new NonNull(Float)) },
          lt: { type: Float },
          lte: { type: Float },
          gt: { type: Float },
          gte: { type: Float },
          not: { type: types[name]! },
        }),
      }),

    IntFilterInput: (name) =>
      new ObjectType({
        name,
        fields: () => ({
          equals: { type: Int },
          in: { type: new List(new NonNull(Int)) },
          lt: { type: Int },
          lte: { type: Int },
          gt: { type: Int },
          gte: { type: Int },
          not: { type: types[name]! },
        }),
      }),

    BooleanFilterInput: (name) =>
      new ObjectType({
        name,
        fields: () => ({
          equals: { type: BooleanScalar },
          not: { type: types[name]! },
        }),
      }),

    DateTimeFilterInput: (name) => {
      const DateTimeScalar = new Scalar({ name: 'DateTime' })

      return new ObjectType({
        name,
        fields: () => ({
          equals: { type: DateTimeScalar },
          in: { type: new List(new NonNull(DateTimeScalar)) },
          lt: { type: DateTimeScalar },
          lte: { type: DateTimeScalar },
          gt: { type: DateTimeScalar },
          gte: { type: DateTimeScalar },
          not: { type: types[name]! },
        }),
      })
    },

    ...invoke(() => {
      const SortOrder = new Scalar({ name: 'SortOrder' })

      return {
        SortOrderInput: (name) =>
          new ObjectType({
            name,
            fields: {
              sort: { type: SortOrder },
              nulls: { type: new Scalar({ name: 'NullsOrder' }) },
            },
          }),

        OrderByRelationAggregateInput: (name) =>
          new ObjectType({
            name,
            fields: {
              _count: { type: SortOrder },
            },
          }),
      }
    }),
  })
  // oxlint-enable typescript-eslint/no-non-null-assertion

  x = Object.entries(x).map(([name, create]) => [name, create(name)])
  x = Object.fromEntries(x)

  return x
})

export const schemaGlobals = invoke(() => {
  let x

  x = new Schema({ types: Object.values(types) })
  x = printSchema(x)
  x = parse(x)

  x = x.definitions.filter(
    (definition) =>
      (definition.kind === Kind.SCALAR_TYPE_DEFINITION &&
        definition.name.value === 'DateTime') !== true,
  )

  return x
})

export { types as groupedGlobals }
