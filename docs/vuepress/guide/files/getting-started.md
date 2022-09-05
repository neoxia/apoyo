# Getting started

This library is a simplified and framework agnostic version of [Adonisjs Drive](https://github.com/adonisjs/drive).

As such, the API, as well as the source code, will be (and will probably stay) very similar to the `Drive` object of the `Adonisjs` framework.

However, additional features and methods may be added later if required.

Here a small usage example:

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

## Installation

All drivers will require the following peer dependencies:

```sh
npm install @apoyo/files @apoyo/std
```

## Supported drivers

### Local driver

This driver is directly included in the `@apoyo/files` package. You don't need to install any other package.

When using this driver, files are written on the local file system, starting at the given root path.

```ts
import { DriverContract, LocalDriver } from '@apoyo/files'

const driver: DriverContract = new LocalDriver({
  root: '/path/to/uploads'
})
```

### Fake driver

This driver is directly included in the `@apoyo/files` package. You don't need to install any other package.

When using this driver, files are written in memory. As such, this driver can be used when written tests, to avoid cluttering your system.

```ts
import { DriverContract, FakeDriver } from '@apoyo/files'

const driver: DriverContract = new FakeDriver({})
```

### S3 driver

To use this driver, you will also need to install the `@apoyo/files-s3` package.

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

**Note**: This driver is a framework agnostic version of [Adonisjs S3 Drive](https://github.com/adonisjs/drive-s3).

### GCS driver

To use this driver, you will also need to install the `@apoyo/files-gcs` package.

When using this driver, files are written in AWS S3.

```ts
import { DriverContract } from '@apoyo/files'
import { GCSDriver } from '@apoyo/files-gcs'

const driver: DriverContract = new GCSDriver({
  // TODO
})
```

**Note**: This driver is a framework agnostic version of [Adonisjs GCS Drive](https://github.com/adonisjs/drive-gcs).

### Azure driver

To use this driver, you will also need to install the `@apoyo/files-azure` package.

When using this driver, files are written in Azure Storage.

```ts
import { DriverContract } from '@apoyo/files'
import { AzureDriver } from '@apoyo/files-azure'

const driver: DriverContract = new AzureDriver({
  // TODO
})
```

**Note**: This driver is framework agnostic version of [Adonisjs Azure Drive](https://github.com/AlexanderYW/Adonis-Drive-Azure-Storage).

### Custom drivers

Custom providers can also be created by implementing the `DriverContract` interface available in `@apoyo/files`.
