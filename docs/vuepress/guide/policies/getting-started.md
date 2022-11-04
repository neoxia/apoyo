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

*Example: Allow all users (including guests) to view published posts, but only allow authors to view posts that are still in draft.*

In the middleware, you won't have access to the current "post", because you only fetch and handle this data in your application layer.

This gives you two (bad) choices:

- Either duplicate some of your application layer code in your middleware (including duplicate database calls), so you can check if the user has the correct access rights are not.

- Either move your authorization logic for this feature to the application layer... which makes your code-base inconsistent: Sometimes your authorization will be in middleware, sometimes not. Sometimes your authorization will be in your application layer, sometimes not.

Both solutions make your code harder to maintain.

**Authorization via inline code**:

Instead of using middlewares that depend on their transport layer, some people put all their authorization code directly in their application layer.

This is in fact a step in the right direction, as it is more flexible and allows for more complex authorization checks. However, it is once again not ideal, because authorization logic is mixed with your application logic. This makes it harder to test and understand.

As such, you should rather always extract these bits of authorization logic in small independent functions, and this library helps you do exactly that.

## Use cases

This library offers a **framework agnostic** and **uniform** way to organize and call your authorization logic, while staying very simple and low-level, so that you can easily support any kind of authorization your application may need:

- If you only require role-based authorization? No problem!

- If you require ACL-based authorization? Create a custom `PolicyContext` able to check in your database if the user has the required rights.

- Want to add authorization middlewares and interceptors, to add special authorization logic to all your existing policies? This is supported as well.

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/policies`

## Typescript configuration

To have full type-safety with this library, the following two options are **required**:

```json
{
  "strictNullChecks": true,
  "strictFunctionTypes": true,
}
```

## Usage

This library exposes five type of objects:

- an `UserContext`, to authenticate a user for a given request / asynchroneous context (see [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) for more information).

- a `PolicyContext`, to define the context that is required to execute our policies.

- a `PolicyBase`, that can be used as a common base for other policies.

- a `Policy`, that for a given action defines **who** can access it. These policy will generally contain **all** your authorization logic.

- an `Authorizer`, which can authorize policies for a given user.

While going through this quick preview, you will see all five of these types being used.

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

*src/policy-context.ts*:

```ts
import { PolicyContext } from '@apoyo/policies'

export class CommonPolicyContext extends PolicyContext<User> {}
```

### Declare policies

*src/policies/common.policy.ts*:

```ts
import { Policy } from '@apoyo/policies'
import { CommonPolicyContext } from '../policy-context'

export namespace CommonPolicy {
  // Create base policy that can serve as a base to all other policies
  export const base = Policy.base<CommonPolicyContext>()
}
```

*src/policies/post.policy.ts*:

```ts
import { Policy } from '@apoyo/policies'
import { CommonPolicyContext } from '../policy-context'
import { CommonPolicy } from './common.policy'

export namespace PostPolicy {

  // Create base policy for all post policies
  const base = pipe(CommonPolicy.base, Policy.namespace('PostPolicy'))

  export const viewPost = pipe(
    base,
    Policy.define('viewPost', (ctx: CommonPolicyContext, post: Post) => {
      // Allow guests (unauthenticated users)
      const user = ctx.getCurrentUser({ allowGuest: true })

      // If post is still in draft status, the post is only viewable by the author
      if (post.status === 'draft') {
        return user?.id === post.userId
      }
      // If post has been published, the post is viewable for every-one
      return true
    })
  )

  export const editPost = pipe(
    base,
    Policy.define('editPost', (ctx: CommonPolicyContext, post: Post) => {
      // No guests are allowed by default
      const user = ctx.getCurrentUser()
      return user.id === post.userId
    })
  )
}
```

### Use authorizer

*src/use-cases/view-post.ts*:

```ts
import { Authorizer } from '@apoyo/policies'
import { PostRepository } from '../repositories/post.repository'

export class ViewPostUseCase {
  constructor(private readonly authorizer: Authorizer, private readonly postRepository: PostRepository) {}

  public async execute(id: string) {
    const post = await this.postRepository.findById(id)

    // Authorize the given policy
    // Required parameters are automatically inferred, and typescript will complain on missing parameters
    await this.authorizer.authorize(PostPolicy.viewPost, post)

    return post
  }
}
```

### With express server

```ts
import { Authorizer, UserContext } from '@apoyo/policies'
import express from 'express'

import { CommonPolicyContext } from './policy-context'
import { PostRepository } from './repositories/post.repository'
import { ViewPostUseCase } from './use-cases/view-post'

// Initialize all dependencies
// You can use an IOC or any other solution of your choice to setup your dependencies
async function initialize() {

  const postRepository = new PostRepository() // not implemented in this demo

  const userContext = new UserContext<User>()
  const policyContext = new CommonPolicyContext(userContext)
  const authorizer = new Authorizer(policyContext)

  const viewPostUseCase = new ViewPostUseCase(authorizer, postRepository)

  return {
    userContext,
    viewPostUseCase
  }
}

async function main() {
  try {
    // Initialize dependencies
    const { userContext, viewPostUseCase } = initialize()

    // Initialize express app
    const app = express()

    app.use((req, res, next) => {
      // Authenticate your user
      const user: User | null = {
        id: 'xxxx',
        email: 'test@example.com',
        role: 'member'
      }
      // Register user in the current user context
      userContext.forUser(user, next)
    })

    app.get('/posts/:id', async (req, res, next) => {
      try {
        const postId = req.params.id
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
