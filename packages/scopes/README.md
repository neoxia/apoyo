# Apoyo - Csv

[![npm version](https://badgen.net/npm/v/@apoyo/csv)](https://www.npmjs.com/package/@apoyo/csv)
[![build size](https://badgen.net/bundlephobia/min/@apoyo/csv)](https://bundlephobia.com/result?p=@apoyo/csv)
[![three shaking](https://badgen.net/bundlephobia/tree-shaking/@apoyo/csv)](https://bundlephobia.com/result?p=@apoyo/csv)

**Warning**: This package is still in development and features may still change, be renamed or removed.

However, we would appreciate any feedback you have on how to improve this library:

- Which features are missing?
- Which features are hard to understand or unnecessary?
- Which features need to be improved?

## Installation

**Warning**: This package has not been deployed to NPM yet and may still be renamed.

`npm install @apoyo/csv`

## Description

This package is based on [papaparse](https://www.papaparse.com/docs), but contains additional utilities or wrappers to simplify the usage and offer better typings.

**Additional features:**

- Async iterator support
- Useful default configurations are enabled
- All headers and fields are automatically trimmed
- Both \n and \r\n are supported at the same time
- UTF-8 BOM character is automatically skipped

## Example

```ts
const inputStream = fs.createReadStream(...)
const csvSeq = Csv.streamAsync(inputStream, 1000, {
  header: true,
  delimiter: ','
})

let header = null
const stats = {
  total: 0,
  ok: 0,
  ko: 0
}
for (const rows of csvSeq) {
  if (!header) {
    header = rows[0].meta.fields
    // check header
    const errors = checkHeader(header)
    if (errors.length > 0) {
      // Abort parsing by throwing or returning
      throw new Error('Invalid header')
    }
  }

  const [ok, ko] = pipe(
    rows,
    Arr.partition((row) => row.errors.length === 0)
  )

  // etc...

  stats.total += rows.length
  stats.ok += ok.length
  stats.ko += ko.length
}

console.log(`File has ${stats.total} lines in total`, stats)
```
