# Examples

Create a new driver instance:

```ts
import { DriverContract, LocalDriver, FakeDriver } from '@apoyo/files'
import { S3Driver } from '@apoyo/files-s3'

// Instantiate the driver you want to use (LocalDriver, FakeDriver, S3Driver or any other available driver)
const driver: DriverContract = new S3Driver({
  bucket: 'my-bucket',
  key: '<aws access key>'
  secret: '<aws secret key>'
})

```

**Simple usage:**

```ts
// Write data to a file
await driver.put('foo.txt', 'hello world')

// Check if file exists
const exists = await driver.exists('foo.txt') // is now true

// Move file
await driver.move('foo.txt', 'bar.txt')

// Delete file
await driver.delete('bar.txt')
```

**Get file with stream:**

```ts
// Constructing finished from stream
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline);

// Get readable stream
const readable = await driver.getStream('input.txt')

// Get writable stream
const writable = await fs.createWriteStream("output.txt");

// Creating transform stream
const transform = zlib.createGzip();

await pipelineAsync(
  readable,
  transform,
  writable
)
```

**Upload file from stream:**

```ts
const stream = fs.createReadStream('path/to/my-huge-archive.tar.gz').pipe(gunzipStream);

await driver.putStream('my-huge-archive.tar', stream)
```

**Note**: If you wish to track the progress of your stream, you will need to use 3rd party libraries, such as <https://www.npmjs.com/package/progress-stream>.
