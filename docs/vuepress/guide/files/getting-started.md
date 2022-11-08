# Getting started

This library is a simplified and framework agnostic version of [Adonis Drive](https://github.com/adonisjs/drive).

As such, the API, as well as the source code, will be (and will probably stay) similar to the `Drive` object of the `Adonisjs` framework.

However, additional features and methods may be added later if required.

Here a small usage example:

```ts
import { FakeDrive } from '@apoyo/files'

const drive = new FakeDrive({})

// Write a file
await drive.put(filePath, stringOrBuffer)
await drive.putStream(filePath, readableStream)

// Read a file
const contents = await drive.get(filePath)
const readableStream = await drive.getStream(filePath)

// Find if a file exists
if (await drive.exists(filePath)) {
  await drive.get(filePath)
}
```

## Goals & Limitations

The primary goal of this library is to provide a consistent API that works across all the storage providers. So, for example, you can use the local file system during development and switch to S3 in production without changing a single line of code.

To guarantee a consistent API, the drives cannot work with the specifics of a given storage service.

For example, you cannot create symlinks with the supported drives since symlinks are a Unix-based file systems concept and cannot be replicated with S3 or GCS.

Similarly, the proprietary features of a cloud service that cannot be replicated across all drives are also not supported.

## Use cases

The primary use case for these drives is to help you quickly manage user-uploaded files. These can be user avatars, blog post cover images, or any other runtime managed documents.

## Installation

All drives will require the following peer dependencies:

```sh
npm install @apoyo/files @apoyo/std
```

## Supported drives

### Local drive

This drive is directly included in the `@apoyo/files` package. You don't need to install any other package.

When using this drive, files are written on the local file system, starting at the given root path.

```ts
import { Drive, LocalDrive } from '@apoyo/files'

const drive: Drive = new LocalDrive({
  root: '/path/to/uploads'
})
```

### Fake drive

This drive is directly included in the `@apoyo/files` package. You don't need to install any other package.

When using this drive, files are written in memory. As such, this drive can be used when written tests, to avoid cluttering your system.

```ts
import { Drive, FakeDrive } from '@apoyo/files'

const drive: Drive = new FakeDrive()
```

### S3 drive

To use this drive, you will also need to install the `@apoyo/files-s3` package.

When using this drive, files are written in AWS S3.

```ts
import { Drive } from '@apoyo/files'
import { S3Drive } from '@apoyo/files-s3'

const drive: Drive = new S3Drive({
  bucket: 'my-bucket',
  key: 'aws access key',
  secret: 'aws secret key'
})
```

**Note**: This drive is a framework agnostic version of [Adonisjs S3 Drive](https://github.com/adonisjs/drive-s3).

### GCS drive

To use this drive, you will also need to install the `@apoyo/files-gcs` package.

When using this drive, files are written in AWS S3.

```ts
import { Drive } from '@apoyo/files'
import { GCSDrive } from '@apoyo/files-gcs'

const drive: Drive = new GCSDrive({
  // TODO
})
```

**Note**: This drive is a framework agnostic version of [Adonisjs GCS Drive](https://github.com/adonisjs/drive-gcs).

### Azure drive

To use this drive, you will also need to install the `@apoyo/files-azure` package.

When using this drive, files are written in Azure Storage.

```ts
import { Drive } from '@apoyo/files'
import { AzureDrive } from '@apoyo/files-azure'

const drive: Drive = new AzureDrive({
  // TODO
})
```

**Note**: This drive is framework agnostic version of [Adonisjs Azure Drive](https://github.com/AlexanderYW/Adonis-Drive-Azure-Storage).

### Custom drive

Custom drives can also be created by implementing the `Drive` interface available in `@apoyo/files`.
