import { strictEqual } from 'assert';
import agent from 'superagent';

import { safe, eicar } from './utils';

export default function () {
  it('should accept one safe file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt');
    strictEqual(body.files.multiple, 1);
    return undefined;
  });

  it('should accept multiple safe file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt');
    strictEqual(body.files.multiple, 3);
    return undefined;
  });

  it('should accept infected file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt');
    strictEqual(body.files.multiple, 1);
    return undefined;
  });

  it('should accept with both safe and infected file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', eicar, 'eicar.txt');
    strictEqual(body.files.multiple, 3);
    return undefined;
  });

  it('should ignore out of limit safe file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt');
    strictEqual(body.files.multiple, 3);
    return undefined;
  });

  it('should ignore out of limit infected file', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/multipleWithoutScan')
      .set('Charset', 'UTF-8')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', safe, 'safe.txt')
      .attach('multiple', eicar, 'eicar.txt');
    strictEqual(body.files.multiple, 3);
    return undefined;
  });
}
