import Busboy from 'busboy';
import ClamScan from 'clamscan';
import { Transform } from 'stream';

class Passthrough extends Transform {
  constructor(options) {
    super(options);
  }

  _transform(chunk, encoding, next) {
    this.push(chunk);
    next();
  }
}

function startScan(clamscan, filename, inputStream, outputStream) {
  return new Promise((resolve, reject) => {
    const av = clamscan.passthrough();
    inputStream.pipe(av).pipe(outputStream);
    av.on('scan-complete', ({ is_infected, viruses }) => {
      if (is_infected) {
        reject(new Error(`Infected file ${filename} (${viruses.join(', ')})`));
      } else {
        resolve();
      }
    });
  });
}

export default function filescan(options) {
  const clamscan = new ClamScan();
  clamscan.init({
    clamdscan: options.scan,
    preference: 'clamdscan',
  });

  return (req, res, next) => {
    const busboy = new Busboy({ headers: req.headers });
    const body = {};
    const files = {};
    const scans = [];

    busboy.on('field', (fieldname, value) => {
      body[fieldname] = value;
    });

    busboy.on(
      'file',
      (fieldname, inputStream, filename, encoding, mimetype) => {
        if (!(fieldname in options.files)) return inputStream.resume();

        const { maxCount = 1, scan = true } = options.files[fieldname];
        const file = {
          stream: new Passthrough(),
          filename,
          encoding,
          mimetype,
        };

        if (maxCount === 1) {
          if (files[fieldname]) {
            return inputStream.resume();
          } else {
            files[fieldname] = file;
          }
        } else {
          files[fieldname] = files[fieldname] || [];

          if (maxCount > files[fieldname].length) {
            files[fieldname].push(file);
          } else {
            return inputStream.resume();
          }
        }

        if (!scan) {
          inputStream.pipe(file.stream);
        } else {
          scans.push(startScan(clamscan, filename, inputStream, file.stream));
        }
      }
    );
    busboy.on('finish', async function () {
      req.body = body;
      req.files = files;
      try {
        await Promise.all(scans);
        next();
      } catch (error) {
        req.unpipe(busboy);
        res.status(400).send(error.toString());
      }
    });
    req.pipe(busboy);
  };
}
