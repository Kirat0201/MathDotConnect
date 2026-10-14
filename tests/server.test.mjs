import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../scripts/server.mjs';
let server, origin;
before(async () => {
  server = makeServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
});
test('serves the app and module dependencies with correct content types', async () => {
  for (const [path, type] of [
    ['/', 'text/html'],
    ['/src/domain.js', 'text/javascript'],
    ['/style.css', 'text/css'],
  ]) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').includes(type));
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(
      response.headers
        .get('content-security-policy')
        .includes("script-src 'self'"),
    );
  }
});
test('health endpoint and HEAD requests work', async () => {
  assert.deepEqual(await (await fetch(origin + '/healthz')).json(), {
    status: 'ok',
  });
  const head = await fetch(origin + '/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
test('does not serve git metadata, configuration, tests or arbitrary files', async () => {
  for (const path of [
    '/.git/config',
    '/package.json',
    '/tests/domain.test.mjs',
    '/%2e%2e%2f.env',
    '/does-not-exist',
  ]) {
    assert.equal((await fetch(origin + path)).status, 404, path);
  }
});
test('rejects malformed URL encoding and writes', async () => {
  assert.equal((await fetch(origin + '/%E0%A4%A')).status, 400);
  const response = await fetch(origin + '/', { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});
