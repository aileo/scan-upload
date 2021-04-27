import { createServer } from 'http';
import express from 'express';
import scanUpload from '../src';

const app = express();
export const server = createServer(app);

const scan = { host: 'clamav', port: 3310 };

function genericHandler(req, res) {
  const files = req.files || {};

  res.status(200).json({
    files: Object.keys(files).reduce((_, file) => {
      _[file] = Array.isArray(files[file]) ? files[file].length : 1;
      return _;
    }, {}),
    body: req.body,
  });
}

app.post('/none', [scanUpload({ scan, files: {} })], genericHandler);

app.post(
  '/singleWithScan',
  [scanUpload({ scan, files: { single: {} } })],
  genericHandler
);
app.post(
  '/singleWithoutScan',
  [scanUpload({ scan, files: { single: { scan: false } } })],
  genericHandler
);
app.post(
  '/multipleWithScan',
  [scanUpload({ scan, files: { multiple: { maxCount: 3 } } })],
  genericHandler
);
app.post(
  '/multipleWithoutScan',
  [scanUpload({ scan, files: { multiple: { maxCount: 3, scan: false } } })],
  genericHandler
);

server.listen(3500);
