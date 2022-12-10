# Resources

Sometimes, you may have resources that needs to be closed / disposed or classes that need to be initialized.

*Example: Database connections, Http servers, etc...*

You can register such resources with providers:

```ts
export class DatabaseModule {
  static DATABASE = pipe(
    Provider.fromClass(Database, [ConfigurationModule.DATABASE]),
    Provider.asResource({
      priority: ShutdownPriority.LOW,
      init: (db) => db.connect(),
      close: (db) => db.disconnect()
    })
  )
}
```

## Init

The `init` function is optional and will only be called when specified.
This will allow you to initialize asynchronously your resource.

## Close

The `close` function is optional and will only be called when specified.
This will allow you to asynchronously close your resource when the container closes.

The priority may be set if you want more fine-grained control in which order the resources should be closed.

*Example*: If we have 2 resources (an HTTP server and a database connection), we want to first close the HTTP server to avoid interrupting ongoing requests.

To configure this, will would need to assign:

- A `ShutdownPriority.HIGH` to the HTTP server
- A `ShutdownPriority.LOW` to the database connection
