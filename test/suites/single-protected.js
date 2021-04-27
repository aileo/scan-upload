import { strictEqual, ifError } from 'assert';
import agent from 'superagent';

import { safe, eicar } from './utils';

export default function () {
  it('should accept safe file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/singleWithScan')
      .set('Charset', 'UTF-8')
      .attach('single', safe, 'safe.txt');
    strictEqual(body.files.single, 1);
    return undefined;
  });

  it('should reject infected file', async function () {
    let error;
    let response;

    try {
      response = await agent
        .post('http://127.0.0.1:3500/singleWithScan')
        .attach('single', eicar, 'eicar.txt');
    } catch (e) {
      error = e;
    }
    strictEqual(error.status, 400);
    ifError(response);
    return undefined;
  });

  it('should ignore safe unconfigured file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/singleWithScan')
      .attach('unconfigured', safe, 'safe.txt');
    ifError(body.files.unconfigured);
    return undefined;
  });

  it('should ignore infected unconfigured file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/singleWithScan')
      .attach('unconfigured', eicar, 'eicar.txt');
    ifError(body.files.unconfigured);
    return undefined;
  });

  it('should ignore second file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/singleWithScan')
      .set('Charset', 'UTF-8')
      .attach('single', safe, 'safe.txt')
      .attach('single', safe, 'safe.txt');
    strictEqual(body.files.single, 1);
    return undefined;
  });
}
