# Policies

Policies are used to tell us **what** can be done by **who**. As such, they form the cornerstone of our authorization.

In other words, they define the rules that are used to check if an user is authorized to make a certain action or not.

*Example: Allow all users (including guests) to view published posts, but only allow authors to view posts that are still in draft.*

## Details

Policies use [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) to run their logic. This enables us to early exit the code (and cancelling the remaining verifications) if necessary.

As such, when a boolean is `yield`ed or `return`ed by the policy, the policy finishes and will either succeed or fail (and throw an `NotAuthorizedException`) depending on if the boolean is true or false.

They take the required `PolicyContext` as the first parameter, and as much additional parameters as required.

Multiple values can be returned:

- If `true` is yielded / returned, no further checks are done and the authorization will preemptively **succeed**.

- If `false` is yielded / returned, no further checks are done and the authorization will preemptively **fail**. An `NotAuthorizationException` is thrown in this case.

- If an exception is thrown, no further checks are done and the authorization will preemptively **fail**.

## Usage

### Context

Before writing policies, you **will** need to define a policy context, which will contain any additional properties or methods required by your policies.

The most basic policy context can be:

```ts
export class MyPolicyContext implements PolicyContext<User> {
  getCurrentUser(): User | null {
    return null
  }
}
```

You may however customize this context however you want:

```ts
import { PolicyContext } from '@apoyo/policies'

export enum Acl {
  WRITE_POSTS = 'write:posts',
  MODERATE_POSTS = 'moderate:posts'
}

export class AclRepository {
  public async hasAccess(_userId: string, _acl: Acl): Promise<boolean> {
    return true
  }
}

export class MyPolicyContext implements PolicyContext<User> {
  constructor(
    private readonly _userContext: UserContext<User>, 
    private readonly _aclRepository: AclRepository) {}

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

  public hasAccess(user: User, acl: Acl) {
    return this._aclRepository.hasAccess(user.id, acl)
  }
}
```

### Creating a policy

It is recommended to always start by creating a common base logic for all your policies. This will make it very easy to add global authorization middlewares if necessary.

*src/policies/base.policy.ts*:

```ts
export namespace BasePolicy {
  /**
   * For now, this function is empty right now.
   * However, this will allow us later on to easily add additional authorization logic to all policies using this middleware.
   *
   * Middlewares will be described in more details on the next page.
   */
  export async function* before(_ctx: MyPolicyContext) {}
}
```

You can then create custom policies using this base policy:

*src/policies/posts.policy.ts*:

```ts
export class EditPostPolicy implements BasePolicy {
  public async *authorize(ctx: MyPolicyContext, post: Post) {
    yield* BasePolicy.before(ctx)

    const user = ctx.getCurrentUser()
    return user.id === post.authorId
  }
}
```
