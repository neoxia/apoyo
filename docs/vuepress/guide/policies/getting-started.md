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

This library exposes multiple concepts:

- The `UserContext`, to authenticate a user for a given request / asynchroneous context (see [AsyncLocalStorage](https://nodejs.org/docs/latest-v14.x/api/async_hooks.html#async_hooks_class_asynclocalstorage) for more information).

- a `PolicyContext`, to define the context that is required to execute our policies.

- a `Policy`, that for a given action defines **who** can access it. These policy will generally contain **all** your authorization logic.

- an `Authorizer`, which can authorize policies for a given user.

While going through this quick preview, you will see all these concepts being used.

### Create some types

*src/user.ts*:

```ts
export interface User {
  id: string
  email: string
  role: 'admin' | 'moderator' | 'member'
}
```

*src/post.ts*:

```ts
export interface Post {
  id: string
  authorId: string
  status: 'draft' | 'published'
}
```

### Create custom user context and policy context

*src/user-context.ts*:

```ts
import { UserContext } from '@apoyo/policies'
import { User } from './user'

export class MyUserContext extends UserContext<User> {}
```

*src/policy-context.ts*:

```ts
import { PolicyContext } from '@apoyo/policies'
import { MyUserContext } from './user-context'

export class MyPolicyContext {
  constructor(
    private readonly _userContext: MyUserContext) {}

  public getCurrentUser(): User
  public getCurrentUser(options: { allowGuest: false }): User
  public getCurrentUser(options: { allowGuest: true }): User | null
  public getCurrentUser(options: { allowGuest: boolean } = { allowGuest: false }): User | null {
    const allowGuest = options?.allowGuest ?? false
    const user = this._userContext.getUser()
    if (!allowGuest && !user) {
      throw new NotAuthenticatedException()
    }
    return user
  }
}
```

*src/authorizer.ts*:

```ts
import { Authorizer } from '@apoyo/policies'
import { MyPolicyContext } from './policy-context'

export class MyAuthorizer extends Authorizer<MyPolicyContext> {
  public getCurrentUser(): User
  public getCurrentUser(options: { allowGuest: false }): User
  public getCurrentUser(options: { allowGuest: true }): User | null
  public getCurrentUser(options: { allowGuest: boolean } = { allowGuest: false }): User | null {
    return this.context.getCurrentUser(options)
  }
}
```

### Declare policies

Policies are used to tell us **what** can be done by **who**. As such, they form the cornerstone of our authorization.

Policies use [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) to run their logic. This enables us to early exit the code (and cancelling the remaining verifications) if necessary.

As such, when a boolean is `yield`ed or `return`ed by the policy, the policy finishes and will either succeed or fail (and throw an `NotAuthorizedException`) depending on if the boolean is true or false.

*src/policies/posts.policy.ts*:

```ts
import { BasePolicy } from '@apoyo/policies'
import { MyPolicyContext } from './policy-context'
import { Post } from './post'

export class ViewPostPolicy implements BasePolicy {
  public async *authorize(ctx: MyPolicyContext, post: Post) {
    if (post.status === 'published') {
      return true
    }

    const user = ctx.getCurrentUser()
    return user.id === post.authorId
  }
}
```

### Use authorizer

*src/use-cases/view-post.ts*:

```ts
import { Authorizer } from '@apoyo/policies'
import { PostRepository } from '../repositories/post.repository'
import { ViewPostPolicy } from '../policies/posts.policy'

export class ViewPostUseCase {
  constructor(private readonly authorizer: Authorizer, private readonly postRepository: PostRepository) {}

  public async execute(id: string) {
    const post = await this.postRepository.findById(id)

    // Authorize the given policy
    // Required parameters are automatically inferred, and typescript will complain on missing parameters
    await this.authorizer.authorize(ViewPostPolicy, post)

    return post
  }
}
```

### Authenticating a user

```ts
const userContext = new MyUserContext()
const policyContext = new MyPolicyContext(userContext)
const authorizer = new MyAuthorizer(policyContext)

// User to authenticate
const user: User | null = {
  id: 'xxxx',
  email: 'test@example.com',
  role: 'member'
}

await userContext.forUser(user, async () => {
  // Authenticated user is available in this scope

  console.log(authorizer.getCurrentUser())
})
```
