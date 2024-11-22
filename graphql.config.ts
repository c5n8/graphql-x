import type { IGraphQLConfig } from 'graphql-config'

export default {
  schema: './src/fixtures/base.gql',
  documents: './src/**/*.gql',
} satisfies IGraphQLConfig
