# Getting started

::: warning
This library is still in development and the API may still change! We appreciate however any feedback you may provide to further improve this library.
:::

This library has been inspired by [Adonisjs Bouncer](https://docs.adonisjs.com/guides/authorization).
This library however is framework agnostic and can easily be used with any framework of your choice.

## Motivations

Writing clean authorization logic is difficult, even more so if you don't know where to start off from.
The countless different **bad** solutions you can encounter on the internet doesn't make this any easier.

Here however a few most commonly encoutered "solutions" that are mentionned most of the time:

### Authorization via middlewares

Some people put authorization code in HTTP middlewares or other similar functions that are tightly linked to your framework or transport layer. However, this solution has multiple issues:

- If you change your transport layer (for example, when migrating some REST endpoints to GraphQL, which requires a different way to authorize your calls), you will need to change all your authorization code.

- When putting authorization code in middlewares, you sometimes won't have access to all information required to make complex authorization checks.<br/>
*Example: You can only view a post if it is published or if you are the author of this post*.<br/>
In your middleware, you won't have access to your "post", because it is executed before you even call your use-case / application logic.<br/>
In this case, you will have authorization logic in your middleware **and** in your application logic.

### Authorization via inline code

Some people put authorization code directly to their services / use-cases. While it is more flexible and allows for more complex authorization checks, it is once again not ideal, because authorization logic is mixed with your application logic, which makes it harder to read and understand **who** can access **what**.

## Use cases

Why does writing authorization have to be this difficult?

This library offers a framework agnostic way to organize and call your authorization logic, while staying very simple and low-level.

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/policies`

## Usage

This library exposes 4 type of objects:

- a `UserContext`, to authenticate a user for a given request / asynchroneous context (see [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) for more information).

- a `PolicyContext`, to define the context that is required to execute our policies.

- a `Policy`, which defines **who** can access **what**.

- an `Authorizer`, which can authorize policies for a given user.

### Create some types

```ts
// src/types.ts

export interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'member'
}

export interface Post {
  id: string
  userId: string
  status: 'draft' | 'published'
}
```

### Create custom policy context

```ts
// src/policy-context.ts

export class CommonPolicyContext extends PolicyContext<User> {}
```

### Declare policies

```ts
// src/policies/post.policy.ts

const viewPost = Policy.create((ctx: CommonPolicyContext, post: Post) => {
  // Allow guests (unauthenticated users)
  const user = ctx.getCurrentUser({ allowGuest: true })

  // If post is still in draft status, the post is only viewable by the author
  if (post.status === 'draft') {
    return user?.id === post.userId
  }
  // If post has been published, the post is viewable for every-one
  return true
})

const editPost = Policy.create((ctx: CommonPolicyContext, post: Post) => {
  // No guests are allowed by default
  const user = ctx.getCurrentUser()
  return user.id === post.userId
})

export const PostPolicy = {
  viewPost,
  editPost
}

// src/policies/global.policy.ts

const isAdmin = Policy.create((ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser()
  if (user.role === 'admin') {
    return true
  }
  // Continue with next policy
  return undefined
})

export const GlobalPolicy = {
  isAdmin
}
```

### Use authorizer

```ts
// src/use-cases/view-post.ts

export class ViewPostUseCase {
  constructor(private readonly authorizer: Authorizer, private readonly postRepository: PostRepository) {}

  public async execute(id: string) {
    const post = await this.postRepository.findById(id)

    await this.authorizer.authorize(PostPolicy.viewPost, post)

    return post
  }
}
```

### With express server

```ts

async function main() {
  try {
    // Initialize all dependencies
    const userContext = new UserContext<User>()
    const policyContext = new CommonPolicyContext(userContext)
    const authorizer = new Authorizer(policyContext, {
      // Policy middlewares
      before: [
        // Check if user is an admin and skip remaining checks if true
        GlobalPolicy.isAdmin
      ]
    })
    const postRepository = new PostRepository() // not implemented here

    const viewPostUseCase = new ViewPostUseCase(authorizer, postRepository)

    // Initialize express app
    const app = express()

    app.use((req, res, next) => {
      // Authenticate your user
      const user: User | null = {
        id: 'xxxx',
        email: 'test@example.com',
        role: 'admin'
      }
      // Register user in the current user context
      userContext.run(user, next)
    })

    app.get('/posts/:id', async (req, res, next) => {
      try {
        const postId = req.params.id // not validated here
        const post = await viewPostUseCase.execute(postId)

        res.status(200).json(post)
      } catch (err) {
        next(err)
      }
    })

    app.listen(3000)

    console.log('Application started on port 3000')
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
```
