# Interceptors

Sometimes, you may want to add additional operations before and after an authorization attempt is done, like for example for logging purposes.

In those cases, you can use the specify an `interceptor` when creating your `Authorizer`:

```ts
const authorizer = new Authorizer(policyContext, {
  async interceptor(ctx, policy, authorize) {
    const user = ctx.getCurrentUser({ allowGuest: true })
    try {
      await authorize()
      console.log(`${policy.name} was authorized for ${user?.email ?? 'Guest' }`)
    } catch (err) {
      console.log(`${policy.name} denied for ${user?.email ?? 'Guest' }`, err)
      throw err
    }
  }
})
```
