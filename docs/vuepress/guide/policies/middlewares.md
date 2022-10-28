# Middlewares

Sometimes, you may want to add additional operations before your policy is executed, to preemptively succeed or fail your policy.

*Example: If an user has an "admin" role, always authorize the user.*

## Usage

By adding the following code to the existing code snippets from the `Getting started` page, we can bypass authorization for admin users.

*src/policies/common.policy.ts*:

```ts
const isAdmin = (ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user?.role === 'admin') {
    // If user is admin, preemptively succeed the authorization
    return true
  }
  // Continue with next middleware or policy
  return undefined
}

// Create base policy that can serve as a base to all other policies
export const CommonPolicyBuilder = pipe(
  Policy.base(),
  // This middleware is executed for all policies based on `CommonPolicyBuilder`
  Policy.before(isAdmin)
)
```

It is also possible to add a middleware that only affects a few given policies:

*src/policies/post.policy.ts*:

```ts
const isPostModerator = async (ctx: CommonPolicyContext) => {
  const user = ctx.getCurrentUser({ allowGuest: true })
  if (user && user.role === 'moderator') {
    const hasAccess = await ctx.hasAccess(user, 'moderate:posts')
    // If has access, preemptively succeed the authorization, if not, we continue
    if (hasAccess) {
      return true
    }
  }
}

// ...

const PostPolicyBuilder = pipe(
  CommonPolicyBuilder,
  Policy.namespace('PostPolicy'),
  // This middleware is only executed for policies based on `PostPolicyBuilder`
  Policy.before(isPostModerator)
)

export const PostPolicy = {
  viewPost: pipe(PostPolicyBuilder, Policy.define('viewPost', viewPost)),
  editPost: pipe(PostPolicyBuilder, Policy.define('editPost', editPost))
}
```
