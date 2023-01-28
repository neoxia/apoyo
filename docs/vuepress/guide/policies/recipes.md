# Recipes

## Usage with express

```ts
const userContext = new MyUserContext()
const policyContext = new MyPolicyContext(userContext)
const authorizer = new MyAuthorizer(policyContext)

// Initialize express app
const app = express()

app.use((req, res, next) => {
  // User to authenticate
  const user: User | null = {
    id: 'xxxx',
    email: 'test@example.com',
    role: 'member'
  }

  // Authenticate user for the current request
  userContext.forUser(user, next)
})

app.get('/profile', (req, res) => {
  const user = authorizer.getCurrentUser({ allowGuest: false });
  res.status(200).json(user)
})

app.listen(3000)

console.log('Http server started on port 3000')
```
