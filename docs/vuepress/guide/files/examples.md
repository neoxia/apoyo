# Examples

Create a new drive instance:

```ts
import { Drive, LocalDrive, FakeDrive } from '@apoyo/files'
import { S3Drive } from '@apoyo/files-s3'

// Instantiate the drive you want to use (LocalDrive, FakeDrive, S3Drive or any other available drive)
const drive: Drive = new S3Drive({
  bucket: 'my-bucket',
  key: '<aws access key>'
  secret: '<aws secret key>'
})
```

**Simple usage:**

```ts
// Write data to a file
await drive.put('foo.txt', 'hello world')

// Check if file exists
const exists = await drive.exists('foo.txt') // is now true

// Move file
await drive.move('foo.txt', 'bar.txt')

// Delete file
await drive.delete('bar.txt')
```

**Get file with stream:**

```ts
// Constructing finished from stream
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline);

// Get readable stream
const readable = await drive.getStream('input.txt')

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

await drive.putStream('my-huge-archive.tar', stream)
```

**Note**: If you wish to track the progress of your stream, you will need to use 3rd party libraries, such as <https://www.npmjs.com/package/progress-stream>.
