# Getting started

This library is a simplified and framework agnostic clone of [Adonisjs Drive](https://github.com/adonisjs/drive).

```ts
import { FakeDriver } from '@apoyo/files'

const driver = new FakeDriver({})

// Write a file
await driver.put(filePath, stringOrBuffer)
await driver.putStream(filePath, readableStream)

// Read a file
const contents = await driver.get(filePath)
const readableStream = await driver.getStream(filePath)

// Find if a file exists
if (await driver.exists(filePath)) {
  await driver.get(filePath)
}
```

## Goals & Limitations

The primary goal of this library is to provide a consistent API that works across all the storage providers. So, for example, you can use the local file system during development and switch to S3 in production without changing a single line of code.

To guarantee a consistent API, the drivers cannot work with the specifics of a given storage service.

For example, you cannot create symlinks with the supported drivers since symlinks are a Unix-based file systems concept and cannot be replicated with S3 or GCS.

Similarly, the proprietary features of a cloud service that cannot be replicated across drivers are also not supported.

## Use cases

The primary use case for these drivers is to help you quickly manage user-uploaded files. These can be user avatars, blog post cover images, or any other runtime managed documents.

## Supported drivers

### Local driver

```sh
npm i @apoyo/files
```

When using this driver, files are written on the local file system, starting at the given root path.

```ts
import { DriverContract, LocalDriver } from '@apoyo/files'

const driver: DriverContract = new LocalDriver({
  root: '/path/to/uploads'
})
```

### Fake driver

```sh
npm i @apoyo/files
```

When using this driver, files are written in memory. As such, this driver can be used when written tests, to avoid cluttering your system.

```ts
import { DriverContract, FakeDriver } from '@apoyo/files'

const driver: DriverContract = new FakeDriver({})
```

### S3 driver

```sh
npm i @apoyo/files @apoyo/files-s3
```

When using this driver, files are written in AWS S3.

```ts
import { DriverContract } from '@apoyo/files'
import { S3Driver } from '@apoyo/files-s3'

const driver: DriverContract = new S3Driver({
  bucket: 'my-bucket',
  key: 'aws access key',
  secret: 'aws secret key'
})
```

### GCS driver

```sh
npm i @apoyo/files @apoyo/files-gcs
```

When using this driver, files are written in AWS S3.

```ts
import { DriverContract } from '@apoyo/files'
import { GCSDriver } from '@apoyo/files-gcs'

const driver: DriverContract = new GCSDriver({
  // TODO
})
```

### Azure driver

```sh
npm i @apoyo/files @apoyo/files-azure
```

When using this driver, files are written in Azure Storage.

```ts
import { DriverContract } from '@apoyo/files'
import { AzureDriver } from '@apoyo/files-azure'

const driver: DriverContract = new AzureDriver({
  // TODO
})
```

### Custom drivers

Custom providers can also be created by implementing the `DriverContract` interface available in `@apoyo/files`.
