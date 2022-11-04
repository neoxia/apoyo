# Middlewares

Sometimes, you may want to add additional operations before your policy is executed, to preemptively succeed or fail your policy.

*Example: If an user has an "admin" role, always authorize the user.*

## Details

A policy middleware is simply a function taking as the first parameter the required policy context. It may take additional parameters if required.

```ts
export const isAdmin = (ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user?.role === 'admin') {
    return true
  }
}
```

Multiple values can be returned:

- If `true` is returned, no further checks are done and the authorization will preemptively **succeed**.

- If `false` is returned, no further checks are done and the authorization will preemptively **fail**. An `NotAuthorizationException` is thrown in this case.

- If an exception is thrown, no further checks are done and the authorization will preemptively **fail**.

- If `undefined` is returned, the next middleware or the policy is executed.

## Usage

By adding the following code to the existing code snippets from the `Getting started` page, we can bypass authorization for admin users.

*src/policies/common.policy.ts*:

```ts
export namespace CommonPolicy {
  export const isAdmin = (ctx: CommonPolicyContext) => {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (user?.role === 'admin') {
      // If user is admin, preemptively succeed the authorization
      return true
    }
    // Continue with next middleware or policy
    return undefined
  }

  // Create base policy that can serve as a base to all other policies
  export const base = pipe(
    Policy.base(),
    // This middleware is executed for all policies based on `CommonPolicy.base`
    Policy.use(isAdmin)
  )
}
```

::: tip
Most of the time, you should **allow guests in your middlewares**, to avoid preemptively failing your authorization in the case the user is not authenticated in your middleware.

For example, if we don't allow guests in the `isAdmin` middleware, the `PostPolicy.viewPost` policy, which allows guests, will still always fail for guests, due to the middleware requiring non-guests users.
:::

### In sub-bases

It is also possible to add a middleware that only affects a few given policies:

*src/policies/post.policy.ts*:

```ts
export namespace PostPolicy {
  export const isPostModerator = async (ctx: CommonPolicyContext) => {
    const user = ctx.getCurrentUser({ allowGuest: true })
    if (user && user.role === 'moderator') {
      const hasAccess = await ctx.hasAccess(user, 'moderate:posts')
      // If the moderator has the given access rights, preemptively succeed the authorization
      // If not, we continue with the next middleware or policy
      if (hasAccess) {
        return true
      }
    }
  }

  const base = pipe(
    CommonPolicy.base,
    Policy.namespace('PostPolicy'),
    // This middleware is only executed for policies based on `PostPolicy.base`
    Policy.use(isPostModerator)
  )

  // ...
}
```
