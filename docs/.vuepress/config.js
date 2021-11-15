module.exports = {
  title: 'Apoyo',
  description: 'Typescript utility library',
  themeConfig: {
    logo: '/img/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Github', link: 'https://github.com/neoxia/apoyo' }
    ],
    sidebar: [
      {
        title: "Introduction",
        collapsable: false,
        sidebarDepth: 0,
        children: [
          '/guide/',
          '/guide/mentions'
        ]
      },
      {
        title: 'Std',
        collapsable: true,
        children: [
          '/guide/std/getting-started.md',
          '/guide/std/pipe.md',
          '/guide/std/error-handling.md',
          '/guide/std/async-utils.md',
          '/guide/std/complex-ordering.md',
          {
            title: 'API',
            collapsable: true,
            sidebarDepth: 0,
            children: [
              ['/guide/std/api/Array.md', 'Array'],
              ['/guide/std/api/NonEmptyArray.md', 'NonEmptyArray'],
              ['/guide/std/api/Dict.md', 'Dictionnary'],
              ['/guide/std/api/Result.md', 'Result'],
              ['/guide/std/api/Promise.md', 'Promise'],
              ['/guide/std/api/Task.md', 'Task'],
              ['/guide/std/api/Ord.md', 'Ord'],
              ['/guide/std/api/String.md', 'String'],
              ['/guide/std/api/Option.md', 'Option'],
              ['/guide/std/api/Enum.md', 'Enum'],
              ['/guide/std/api/Err.md', 'Err'],
              ['/guide/std/api/Tree.md', 'Tree'],
              ['/guide/std/api/Seq.md', 'Seq']
            ]
          }
        ]
      },
      {
        title: 'Decoders',
        collapsable: true,
        children: [
          '/guide/decoders/getting-started.md',
          '/guide/decoders/decode-errors.md',
          '/guide/decoders/creating-custom-decoders.md',
          {
            title: 'API',
            collapsable: true,
            sidebarDepth: 0,
            children: [
              ['/guide/decoders/api/Decoder.md', 'Decoder'],
              ['/guide/decoders/api/TextDecoder.md', 'TextDecoder'],
              ['/guide/decoders/api/NumberDecoder.md', 'NumberDecoder'],
              ['/guide/decoders/api/IntegerDecoder.md', 'IntegerDecoder'],
              ['/guide/decoders/api/BooleanDecoder.md', 'BooleanDecoder'],
              ['/guide/decoders/api/ArrayDecoder.md', 'ArrayDecoder'],
              ['/guide/decoders/api/ObjectDecoder.md', 'ObjectDecoder'],
              ['/guide/decoders/api/EnumDecoder.md', 'EnumDecoder'],
              ['/guide/decoders/api/DateDecoder.md', 'DateDecoder']
            ]
          }
        ]
      },
      {
        title: 'Scopes',
        collapsable: true,
        children: [
          '/guide/scopes/getting-started.md'
        ]
      },
      {
        title: 'Http',
        collapsable: true,
        children: [
          '/guide/http/getting-started.md',
          {
            title: 'API',
            collapsable: true,
            sidebarDepth: 0,
            children: [
              ['/guide/http/api/Http.md', 'Http'],
              ['/guide/http/api/HttpCode.md', 'HttpCode'],
              ['/guide/http/api/Response.md', 'Response']
            ]
          }
        ]
      },
    ],
    sidebarDepth: 1
  }
}