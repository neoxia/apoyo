# Resources

Sometimes, you may want to create an injectable that needs to be closed / disposed when it is not used anymore.

*Example: Database connections, Http servers, etc...*

This type of injectable can be created in the following way:

```ts
const Api = pipe(
  Injectable.struct({
    config: ApiConfig
  }),
  Injectable.resource(({ config }) => {

    const app = express()

    const server = app.listen(config.port)

    const close = async () => {
      return new Promise((resolve, reject) => {
        server.close((err) => err ? reject(err) : resolve(err))
      })
    }

    return Resource.of(app, close)
  })
)
```

**Note**: The injectable will only be disposed when the scope into which the injectable has been mounted is closed.
