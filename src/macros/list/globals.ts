import { GraphQLBoolean as BooleanScalar } from 'graphql'
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

const IDFilterInput: ObjectType = new ObjectType({
  name: 'IDFilterInput',
  fields: () => ({
    equals: { type: ID },
    in: { type: new List(new NonNull(ID)) },
    not: { type: IDFilterInput },
  }),
})

const QueryMode = new Scalar({ name: 'QueryMode' })

const StringFilterInput: ObjectType = new ObjectType({
  name: 'StringFilterInput',
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
    mode: { type: QueryMode },
    not: { type: StringFilterInput },
  }),
})

const FloatFilterInput: ObjectType = new ObjectType({
  name: 'FloatFilterInput',
  fields: () => ({
    equals: { type: Float },
    in: { type: new List(new NonNull(Float)) },
    lt: { type: Float },
    lte: { type: Float },
    gt: { type: Float },
    gte: { type: Float },
    not: { type: FloatFilterInput },
  }),
})

const IntFilterInput: ObjectType = new ObjectType({
  name: 'IntFilterInput',
  fields: () => ({
    equals: { type: Int },
    in: { type: new List(new NonNull(Int)) },
    lt: { type: Int },
    lte: { type: Int },
    gt: { type: Int },
    gte: { type: Int },
    not: { type: IntFilterInput },
  }),
})

const BooleanFilterInput: ObjectType = new ObjectType({
  name: 'BooleanFilterInput',
  fields: () => ({
    equals: { type: BooleanScalar },
    not: { type: BooleanFilterInput },
  }),
})

const DateTimeScalar = new Scalar({ name: 'DateTime' })

const DateTimeFilterInput: ObjectType = new ObjectType({
  name: 'DateTimeFilterInput',
  fields: () => ({
    equals: { type: DateTimeScalar },
    in: { type: new List(new NonNull(DateTimeScalar)) },
    lt: { type: DateTimeScalar },
    lte: { type: DateTimeScalar },
    gt: { type: DateTimeScalar },
    gte: { type: DateTimeScalar },
    not: { type: DateTimeFilterInput },
  }),
})

const SortOrder = new Scalar({ name: 'SortOrder' })
const NullsOrder = new Scalar({ name: 'NullsOrder' })

const SortOrderInput = new ObjectType({
  name: 'SortOrderInput',
  fields: {
    sort: { type: SortOrder },
    nulls: { type: NullsOrder },
  },
})

const OrderByRelationAggregateInput = new ObjectType({
  name: 'OrderByRelationAggregateInput',
  fields: {
    _count: { type: SortOrder },
  },
})

export const schemaGlobals = invoke(() => {
  let x

  x = new Schema({
    types: [
      IDFilterInput,
      StringFilterInput,
      FloatFilterInput,
      IntFilterInput,
      BooleanFilterInput,
      DateTimeFilterInput,
      SortOrderInput,
      OrderByRelationAggregateInput,
    ],
  })

  x = printSchema(x)
  x = parse(x)

  x = x.definitions.filter(
    (definition) =>
      (definition.kind === Kind.SCALAR_TYPE_DEFINITION &&
        definition.name.value === 'DateTime') === false,
  )

  return x
})
