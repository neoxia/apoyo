# Apoyo - Files

[![npm version](https://badgen.net/npm/v/@apoyo/files)](https://www.npmjs.com/package/@apoyo/files)

## Installation

Install peer dependencies:
`npm install @apoyo/std`

Install package:
`npm install @apoyo/files`

## Introduction

This library is a simplified framework agnostic version of [Adonisjs Drive](https://github.com/adonisjs/drive).

The following file drivers are provided by default:

- Local file driver (included in `@apoyo/files`)
- Memory / Fake driver (included in `@apoyo/files`)
- AWS S3 driver (included in `@apoyo/files-s3`)
- GCS driver (included in `@apoyo/files-gcs`)
- Azure storage driver (included in `@apoyo/files-azure`)

Custom providers can also be created by implementing the `DriverContract` interface available in `@apoyo/files`.

## Documentation

TODO

Look up the [DriverContract](https://github.com/neoxia/apoyo/tree/master/packages/files/src/driver.ts) interface until the documentation has been written.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
