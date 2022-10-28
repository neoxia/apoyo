# Getting started

::: warning
This library is still in development and the API may still change! We appreciate any feedback you may provide to further improve this library.
:::

This library has been inspired by [Adonisjs Bouncer](https://docs.adonisjs.com/guides/authorization).
However, this library is framework agnostic and can, as such, easily be used with any framework of your choice.

## Motivations

Writing clean authorization logic is difficult, even more so if you don't know where to start off from.
The countless different **bad** solutions you can encounter on the internet doesn't make this any easier.

Here however a few most commonly encoutered "solutions" that are mentionned most of the time:

**Authorization via middlewares**:

Some people put authorization code in HTTP middlewares or other similar functions that are tightly linked to your framework or transport layer. However, this solution has multiple issues:

- If you change your transport layer (for example, when migrating some REST endpoints to GraphQL, which requires a different way to authorize your calls), you will need to change all your authorization code, or even duplicate authorization code if you want to support multiple transport layers.

- When putting authorization code in middlewares, you sometimes won't have access to all information required to make complex authorization checks.

*Use-case example: An user should only be able to view a post if it is published or if he is the author of the post*.

In the middleware, you won't have access to the current "post", because you only fetch and handle this data in your use-case / application logic.

In this case, you will have authorization logic in your middleware (outside of your application logic) **and** in your application logic.

**Authorization via inline code**:

Some people put authorization code directly to their services / use-cases. While it is more flexible and allows for more complex authorization checks, it is once again not ideal, because authorization logic is mixed with your application logic, which makes it harder to read and understand **who** can access **what**.

## Use cases

Why does writing authorization have to be this difficult?

This library offers a framework agnostic way to organize and call your authorization logic, while staying very simple and low-level, so that you can easily support any kind of authorization your application may need:

- If you only require role-based authorization? No problem!

- If you require ACL-based authorization? Create a custom `PolicyContext` able to check in your database if the user has the required rights.

- Want to add authorization middlewares and interceptors, to add special authorization logic to all your existing policies? This is supported as well.

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

export class CommonPolicyContext extends PolicyContext<User> {
  constructor(userContext: UserContext<User>, private readonly aclRepository: AclRepository) {
    super(userContext)
  }

  public async hasAccess(user: User, acl: string) {
    return this.aclRepository.hasAcl(user.id, acl)
  }
}
```

### Declare policies

```ts
// src/policies/common.policy.ts

const isAdmin = (ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user?.role === 'admin') {
    return true
  }
  // Continue with next policy
  return undefined
}

// Create base policy that can serve as a base to all other policies
export const commonPolicy = pipe(
  Policy.base(),
  Policy.before(isAdmin)
)

// src/policies/post.policy.ts

const isPostModerator = async (ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user && user.role === 'moderator') {
    return ctx.hasAccess(user, 'moderate:posts')
  }
}

const viewPost = (ctx: CommonPolicyContext, post: Post) => {
  // Allow guests (unauthenticated users)
  const user = ctx.getCurrentUser({ allowGuest: true })

  // If post is still in draft status, the post is only viewable by the author
  if (post.status === 'draft') {
    return user?.id === post.userId
  }
  // If post has been published, the post is viewable for every-one
  return true
}

const editPost = (ctx: CommonPolicyContext, post: Post) => {
  // No guests are allowed by default
  const user = ctx.getCurrentUser()
  return user.id === post.userId
}

const postPolicy = pipe(
  commonPolicy,
  Policy.namespace('PostPolicy'),
  Policy.before(isPostModerator)
)

export const PostPolicy = {
  viewPost: pipe(postPolicy, Policy.define('viewPost', viewPost)),
  editPost: pipe(postPolicy, Policy.define('editPost', editPost))
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
    const postRepository = new PostRepository() // not implemented here
    const aclRepository = new AclRepository() // not implemented here

    const userContext = new UserContext<User>()
    const policyContext = new CommonPolicyContext(userContext, aclRepository)
    const authorizer = new Authorizer(policyContext, {
      async interceptor(user, action, authorize) {
        try {
          await authorize()
          console.log(`${action} was authorized for ${user?.email ?? 'Guest' }`)
        } catch (err) {
          console.log(`${action} denied for ${user?.email ?? 'Guest' }`, err)
          throw err
        }
      }
    })

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
