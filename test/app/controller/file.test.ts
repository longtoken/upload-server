import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('test/app/controller/file.test.ts', () => {
  it('should GET /', async () => {
    const testHash = 'e62d28dd31fc4d1e92a81e7ae5be3cc6';
    const result = await app.httpRequest()
      .get('/list')
      .query({ fileName: '归档 2.zip', fileMd5Val: testHash })
      .expect(200);
    assert.deepEqual(result.body, { hash: testHash, fileExist: false });
  });
});
