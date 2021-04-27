import { deepStrictEqual } from 'assert';
import agent from 'superagent';

import { server } from '../dev/server';

import singleProtected from './suites/single-protected';
import singleUnprotected from './suites/single-unprotected';
import multipleProtected from './suites/multiple-protected';
import multipleUnprotected from './suites/multiple-unprotected';

after(function (done) {
  server.close(done);
});

describe('Body field', function () {
  it('should parse body', async function () {
    const { body } = await agent
      .post('http://127.0.0.1:3500/none')
      .field('foo', 'bar');
    deepStrictEqual(body, { files: {}, body: { foo: 'bar' } });
    return undefined;
  });
});
describe('Single file', function () {
  describe('Protected route', singleProtected);
  describe('Unprotected route', singleUnprotected);
});
describe('Multiple file', function () {
  describe('Protected route', multipleProtected);
  describe('Unprotected route', multipleUnprotected);
});
