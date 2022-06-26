# Advanced features

## Switching between multiple injectables

Sometimes, we may want to dynamically switch between multiple implementations based on another injectable:

```ts
const $fileProvider = Injectable.define([$env], (env) => {
  const provider = env.FILE_PROVIDER
  if (provider === 's3') return $s3FileProvider
  if (provider === 'local') return $localFileProvider 
  throw new Error(`Unsupported file provider ${JSON.stringify(provider)}`)
})
```

**Note**: Injectables that are not returned are not loaded. As such, this operation is more efficient than loading all injectables and switching on their values.
