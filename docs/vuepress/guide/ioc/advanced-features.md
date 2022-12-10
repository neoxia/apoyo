# Advanced features

## Switching between multiple providers

Sometimes, we may want to dynamically switch between multiple providers based on another provider:

```ts
export class DriveModule {
  private static S3_DRIVE = Provider.fromClass(S3Drive, [ConfigurationModule.DRIVE_S3])
  private static LOCAL_DRIVE = Provider.fromClass(LocalDrive, [ConfigurationModule.DRIVE_LOCAL])

  static DRIVE = Provider.from(
    async (container): Promise<Provider<Drive>> => {
      const config = await container.get(ConfigurationModule.DRIVE)
      const driver = config.driver
      if (driver === 's3') return DriveModule.S3_DRIVE
      if (driver === 'local') return DriveModule.LOCAL_DRIVE
      throw new Error(`Unsupported file driver ${JSON.stringify(driver)}`)
    }
  )
}
```

**Note**: Providers that are not returned are not loaded. As such, this operation is more efficient than loading all providers and switching on their values.
