import { createBundle } from '#package/document.js'
import type { Document } from '#package/document.js'
import { invoke } from '@txe/invoke'
import { Kind } from 'graphql'
import { parse } from 'graphql'
import * as prettier from 'prettier'
import { print } from 'graphql'

export async function execExpansion({
  expand,
  schema: initialSchema,
}: {
  expand: (document: Document) => Document | Promise<Document>
  schema: string
}) {
  const initialAST = parse(initialSchema)
  const document = await expand({
    bundles: initialAST.definitions.map((node) =>
      createBundle({
        node,

        directives: invoke(() => {
          if (
            node.kind === Kind.OBJECT_TYPE_DEFINITION &&
            node.directives !== undefined
          ) {
            return node.directives.map((directive) => directive.name.value)
          }

          return []
        }),
      }),
    ),
    globals: [],
  })

  const result = await invoke(async () => {
    let x

    x = document.bundles.flatMap((bundle) => [
      print(bundle.node),
      ...bundle.directives.flatMap((directive) => {
        const type =
          bundle.node.kind === Kind.OBJECT_TYPE_DEFINITION &&
          bundle.node.name.value

        return [
          `# start: @${directive} ${type}`,

          // oxlint-disable-next-line typescript-eslint(no-non-null-assertion)
          ...bundle.groupedExpansions[directive]!.map((expansion) =>
            print(expansion),
          ),
          `# end: @${directive} ${type}`,
        ].join('\n\n')
      }),
    ])

    x = x.join('\n\n')

    x = [
      x,
      ...document.globals.reduce((set, definition) => {
        const printed = print({
          kind: Kind.DOCUMENT,
          definitions: [definition],
        })

        set.add(printed)

        return set
      }, new Set<string>()),
    ].join('\n\n')

    x = await prettier.format(x, { parser: 'graphql' })

    return x
  })

  return result
}
