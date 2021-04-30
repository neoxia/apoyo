module.exports = {
  title: 'Apoyo',
  description: 'Typescript utility library',
  themeConfig: {
    logo: '/img/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Github', link: 'https://github.com/neoxia/apoyo-std' }
    ],
    sidebar: [
      {
        title: "Introduction",
        path: '/guide/'
      },
      {
        title: "Pipe",
        path: '/guide/pipe.md'
      },
      {
        title: 'Namespaces',
        collapsable: false,
        sidebarDepth: 0,
        children: [
          ['/guide/namespaces/Array.md', 'Array'],
          ['/guide/namespaces/NonEmptyArray.md', 'NonEmptyArray'],
          ['/guide/namespaces/Dict.md', 'Dictionnary'],
          ['/guide/namespaces/Result.md', 'Result'],
          ['/guide/namespaces/Promise.md', 'Promise'],
          ['/guide/namespaces/Task.md', 'Task'],
          ['/guide/namespaces/Ord.md', 'Ord'],
          ['/guide/namespaces/String.md', 'String'],
          ['/guide/namespaces/Option.md', 'Option'],
          ['/guide/namespaces/Enum.md', 'Enum'],
          ['/guide/namespaces/Err.md', 'Err'],
          ['/guide/namespaces/Tree.md', 'Tree'],
        ]
      }
    ],
    sidebarDepth: 1
  }
}