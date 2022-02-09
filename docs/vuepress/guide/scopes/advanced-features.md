# Advanced features

## Switching between multiple injectables

Sometimes, we may want to dynamically switch between multiple implementations based on another injectable.
In those cases, you may use `Injectable.chain`:

```ts
const FileProvider = pipe(
  Env,
  Injectable.chain(env => {
    const provider = env.FILE_PROVIDER
    if (provider === 'aws') return S3FileProvider
    if (provider === 'azure') return AzureFileProvider 
    throw new Error(`Unimplemented file provider ${JSON.stringify(provider)}`)
  })
)
```

**Note**: Injectables that are not returned are not loaded. As such, this operation is more efficient than loading all injectables and switching on their values.

## Dynamically create an injectable

Abstracts help you create injectables for a specific interface. This also means that it can only have 1 implementation at a time.

Sometimes, you may need to create multiple injectables per scope depending on a dynamic value.
In this case, you can simply create a function returning a new injectable:

```ts
const forParam = (name: string) => pipe(
  Request,
  Injectable.map(req => req.params[name])
)

const Params = {
  Id: forParam('id'), // Injectable<string>
  Slug: forParam('slug') // Injectable<string>
}
```

**Note**: Each injectable has his own "reference". If you call the same function `forParam` twice with the same parameters, it will return 2 different injectables. This means that those injectable will be re-computed when called.

## Dynamically create an injectable depending on another injectable

TODO
