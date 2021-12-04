import * as tsdoc from '@microsoft/tsdoc'
import { DocNode, DocExcerpt } from '@microsoft/tsdoc'

export interface DocParam {
  name: string
  description: string
}

export interface DocElement {
  namespace?: string
  modifiers: string[]
  deprecated?: string
  description?: string
  see: string[]
  params: DocParam[]
  returns?: string
  example?: string
}

const createConfig = () => {
  const customConfiguration: tsdoc.TSDocConfiguration = new tsdoc.TSDocConfiguration()
  const namespaceDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@namespace',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag
  })

  const descriptionDefinition: tsdoc.TSDocTagDefinition = new tsdoc.TSDocTagDefinition({
    tagName: '@description',
    syntaxKind: tsdoc.TSDocTagSyntaxKind.BlockTag
  })

  customConfiguration.addTagDefinitions([namespaceDefinition, descriptionDefinition])

  return customConfiguration
}

const createParser = () => new tsdoc.TSDocParser(createConfig())

const renderDocNode = (docNode: DocNode): string => {
  let result = ''
  if (docNode) {
    if (docNode instanceof DocExcerpt) {
      result += docNode.content.toString()
    }
    for (const childNode of docNode.getChildNodes()) {
      result += renderDocNode(childNode)
    }
  }
  return result
}

export function parseDoc(comment: string): DocElement {
  const parser = createParser()
  const docComment = parser.parseString(comment).docComment

  const runIO = <A>(fn: () => A) => fn()

  return {
    modifiers: docComment.modifierTagSet.nodes.map((x) => x.tagName.slice(1)),

    namespace: runIO(() => {
      const description = docComment.customBlocks.find((block) => block.blockTag.tagName === '@namespace')
      return description ? renderDocNode(description.content).trim() : undefined
    }),

    deprecated: runIO(() => {
      return docComment.deprecatedBlock ? renderDocNode(docComment.deprecatedBlock.content).trim() : undefined
    }),

    description: runIO(() => {
      const description = docComment.customBlocks.find((block) => block.blockTag.tagName === '@description')
      return description ? renderDocNode(description.content).trim() : undefined
    }),

    see: runIO(() => {
      return docComment.seeBlocks.map((b) => renderDocNode(b.content))
    }),

    params: runIO(() => {
      return docComment.params.blocks.map((paramBlock) => ({
        name: paramBlock.parameterName,
        description: renderDocNode(paramBlock.content).trim()
      }))
    }),

    returns: runIO(() => {
      return docComment.returnsBlock ? renderDocNode(docComment.returnsBlock.content).trim() : undefined
    }),

    example: runIO(() => {
      const example = docComment.customBlocks.find((block) => block.blockTag.tagName === '@example')
      return example ? renderDocNode(example.content).trim() : undefined
    })
  }
}
