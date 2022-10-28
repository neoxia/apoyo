# Interceptors

Sometimes, you may want to add additional operations before and after an authorization attempt is done, like for example for logging purposes.

In those cases, you can use the specify an `interceptor` when creating your `Authorizer`:

```ts
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
```
