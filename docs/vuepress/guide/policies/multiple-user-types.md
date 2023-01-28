# Multiple user types

To handle multiple types of users with a same authorizer, you only need to update your policy context:

```ts
export class MyPolicyContext {
  constructor(private readonly _userContext: UserContext<Customer | Employee>) {}

  public getCustomer(): Customer
  public getCustomer(options: { allowGuest: false }): Customer
  public getCustomer(options: { allowGuest: true }): Customer | null
  public getCustomer(options: { allowGuest: boolean } = { allowGuest: false }): Customer | null {
    const allowGuest = options?.allowGuest ?? false
    const user = this._userContext.getUser()
    if (user instanceof Customer) {
      return user
    }
    if (allowGuest) {
      return null
    }
    throw new NotAuthenticatedException()
  }

  public getEmployee(): Employee
  public getEmployee(options: { allowGuest: false }): Employee
  public getEmployee(options: { allowGuest: true }): Employee | null
  public getEmployee(options: { allowGuest: boolean } = { allowGuest: false }): Employee | null {
    const allowGuest = options?.allowGuest ?? false
    const user = this._userContext.getUser()
    if (user instanceof Employee) {
      return user
    }
    if (allowGuest) {
      return null
    }
    throw new NotAuthenticatedException()
  }
}
```

You can also extend the Authorizer to customize your authorizer:

```ts
export class MyAuthorizer extends Authorizer<MyPolicyContext> {
  public getCustomer(): Customer
  public getCustomer(options: { allowGuest: false }): Customer
  public getCustomer(options: { allowGuest: true }): Customer | null
  public getCustomer(options: { allowGuest: boolean } = { allowGuest: false }): Customer | null {
    return this.context.getCustomer(options)
  }

  public getEmployee(): Employee
  public getEmployee(options: { allowGuest: false }): Employee
  public getEmployee(options: { allowGuest: true }): Employee | null
  public getEmployee(options: { allowGuest: boolean } = { allowGuest: false }): Employee | null {
    return this.context.getEmployee(options)
  }
}
```
