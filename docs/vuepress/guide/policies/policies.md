# Policies

Policies define the rules that are used to check if an user is authorized to make a certain action or not.

*Example: Allow all users (including guests) to view published posts, but only allow authors to view posts that are still in draft.*

## Details

A policy is simply a function taking as the first parameter the required policy context. It may take additional parameters if required.

Multiple values can be returned:

- If `true` is returned, no further checks are done and the authorization will preemptively **succeed**.

- If `false` is returned, no further checks are done and the authorization will preemptively **fail**. An `NotAuthorizationException` is thrown in this case.

- If an exception is thrown, no further checks are done and the authorization will preemptively **fail**.

## Usage

### Context

Before writing policies, you **will** need to define a policy context, which will contain any additional properties or methods required by your policies.

The most basic policy context can be:

```ts
export class CommonPolicyContext extends PolicyContext<User> {}
```

You may however customize this context however you want:

```ts
export class CommonPolicyContext extends PolicyContext<User> {
  constructor(userContext: UserContext<User>, private readonly aclRepository: AclRepository) {
    super(userContext)
  }

  public async hasAccess(user: User, acl: string) {
    return this.aclRepository.hasAcl(user.id, acl)
  }
}
```

### Creating a policy

It is recommended to always start by creating a common base policy for all your policies. This will make it very easy to add global authorization middlewares if necessary.

*src/policies/common.policy.ts*:

```ts
export namespace CommonPolicy {
  // Create base policy that can serve as a base to all other policies
  export const base = Policy.base<CommonPolicyContext>()
}
```

You can then create custom policies using this base policy:

```ts
export const editPostPolicy = pipe(
  CommonPolicy.base, 
  Policy.define('editPostPolicy', (ctx: CommonPolicyContext, post: Post) => {
    const user = ctx.getCurrentUser()
    const isAuthor = post.authorId === user.id
    return isAuthor
  })
)
```

**Note**: Each policy is given a specific name, to allow easier debugging and tracing when writing interceptors.

### Grouping policies

You can also group policies for a same context together:

```ts
export namespace PostPolicy {

  const base = pipe(CommonPolicy.base, Policy.namespace('PostPolicy'))

  // As this policy is based on the policy base declared above, its final name will be "PostPolicy.editPost"
  export const editPost = pipe(
    base, 
    Policy.define('editPost', (ctx: CommonPolicyContext, post: Post) => {
      const user = ctx.getCurrentUser()
      const isAuthor = post.authorId === user.id
      return isAuthor
    })
  )
}
```
