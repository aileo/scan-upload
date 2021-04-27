# scan-upload

An [Express](https://expressjs.com/) middleware to handle file upload from multipart/form-data and scan them with ClamAV

Built on [Busboy](https://www.npmjs.com/package/busboy) and [Clamscan](https://www.npmjs.com/package/clamscan)

## Usage

This middleware parse the request payload using Content-Type multipart/form-data.

### Options

#### scan

The `clamdscan` part of clamscan's options as described [here](https://www.npmjs.com/package/clamscan#getting-started).
The rest of the clamscan's options are not exposed as [it will not be used](https://www.npmjs.com/package/clamscan#getting-started)

#### files

An index of expected files in the request payload using field name as the index key and field configuration as entry.
Each entry can be an empty object as every option have default value.

| Option   | Description                                                 | default value |
| -------- | ----------------------------------------------------------- | ------------- |
| maxCount | Number of file that could be uploaded in the related field. | 1             |
| scan     | Flag to disable the viral scan.                             | true          |

### Result

Each field found in the payload will be added to the `request.body` object using field name as key.
Each file in the body found with a matching field configuration will be added to the `request.files` object using field name as key.
Depending on `maxCount`, `request.files` entries can be an object for a single expected file (IE. ``maxCount === 1) or an array of those object (one for each file).
Each file object contain the following properties:

| Property | Description                         |
| -------- | ----------------------------------- |
| stream   | Readable stream of the file content |
| filename | Original file name                  |
| encoding | Stream encoding                     |
| mimetype | File mime-type                      |

### Example

```js
import { createServer } from 'http';
import { createWriteStream } from 'fs';
import express from 'express';
import scanUpload from 'scan-upload';

const app = express();
const server = createServer(app);

app.post(
  '/upload',
  [
    scanUpload({
      files: {
        foo: { maxCount: 1, scan: true },
        bar: { maxCount: 10, scan: false },
      },
      scan: { host: 'clamav', port: 3310 },
    }),
  ],
  (req, res) => {
    // Do something with req.files.foo and res.files.bar
    if (req.files.foo) {
      // req.files.foo is an object as maxCount = 1
      // Let's write it to disk as it was scanned
      req.files.foo.stream.pipe(createWriteStream('./foo'));
    }

    if (req.files.bar) {
      // req.files.bar is an array of objects (if at least one file was in the payload)
      req.files.bar.forEach(({ stream }) => {
        // Do something with each file stream
      });
    }
  }
);

server.listen(3500, () => {
  console.log('listenning on port 3500');
});
```

## Development

Run `npm run dev`, it will start server defined in [dev/server.js](dev/server.js) in watch mode.

## Lint

Run `npm run lint`.

## Test

Require docker-compose 1.18+ (because of the `--no-log-prefix` flag).

Run `npm run test`.

Tests use [EICAR test file](https://www.eicar.org/?page_id=3950) to trigger ClamAV.

## Contribution

Contributions are more than welcome. Feel free to submit any pull request as long as you added unit tests if relevant and passed them all and the linter.

## License

MIT License

Copyright (c) 2021 aileo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
