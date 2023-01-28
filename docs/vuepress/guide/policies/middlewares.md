# Middlewares

Sometimes, you may want to add additional operations before your policy is executed, to preemptively succeed or fail your policy.

*Example: If an user has an "admin" role, always authorize the user.*

## Details

A policy middleware is simply a generator yielding a boolean. It can take any parameter it may require to run. The main policy will need to supply these parameters in that case.

```ts

export namespace BasePolicy {

  export async function* isAdmin(ctx: MyPolicyContext) {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (user?.role === 'admin') {
      yield true
    }
  }

  export async function* requireAcl(ctx: MyPolicyContext, acl: Acl) {
    const hasAcl = await ctx.hasAccess(ctx.getCurrentUser(), acl)
    if (!hasAcl) {
      yield false
    }
  }

  export async function* before(ctx: MyPolicyContext) {
    yield* isAdmin(ctx)
  }
}
```

- If `true` is yielded, no further checks are done and the authorization will preemptively **succeed**.

- If `false` is yielded, no further checks are done and the authorization will preemptively **fail**. An `NotAuthorizationException` is thrown in this case.

- If an exception is thrown, no further checks are done and the authorization will preemptively **fail**.

- If no value is yielded, the policy will continue as normal.

## Usage

By adding the following code to the existing code snippets from the `Getting started` page, we can bypass authorization for admin users.

*src/policies/posts.policy.ts*:

```ts
export class EditPostPolicy implements BasePolicy {
  public async *authorize(ctx: MyPolicyContext, post: Post) {
    yield* BasePolicy.before(ctx)
    yield* BasePolicy.requireAcl(ctx, Acl.WRITE_POSTS)

    const user = ctx.getCurrentUser()
    return user.id === post.authorId
  }
}
```

::: tip
Don't forget to **allow guests in your middlewares** if necessary, to avoid preemptively failing your authorization in the case the user is not authenticated.

For example, if we don't allow guests in the `isAdmin` middleware, the `ViewPostPolicy` policy, which allows guests, will always fail, due to the middleware requiring non-guests users.
:::
