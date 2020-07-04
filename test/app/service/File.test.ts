import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';

describe('test/app/service/File.test.js', () => {
  let ctx: Context;

  before(async () => {
    ctx = app.mockContext();
  });

  describe('getFileInfo function', () => {
    it('文件hash不存在情况', async () => {
      const hashValueNonExistent = 'hashValueNonExistent';
      const nonExistent = await ctx.service.file.getFileInfo(hashValueNonExistent, 'suffix');
      assert.deepEqual(nonExistent, { isFileExist: false, name: hashValueNonExistent });
    });
    // it('文件hash存在的情况', async () => {
    //   const hashValue = 'a44c1652b7e4a8314624640021197fd3';
    //   const existent = await ctx.service.file.getFileInfo(hashValue, 'suffix');
    //   assert.deepEqual(existent, { isFileExist: true, name: hashValue });
    // });
  });

  describe('getFileList function', () => {
    it('文件夹hash不存在情况', async () => {
      const hashValueNonExistent = 'hashValueNonExistent';
      const nonExistent = await ctx.service.file.getFileList(hashValueNonExistent);
      assert.deepEqual(nonExistent, []);
    });
    it('文件夹hash存在的情况', async () => {// 在public/uploads里面创建对应的文件
      const hashValue = 'e62d28dd31fc4d1e92a81e7ae5be3cc6';
      const existent = await ctx.service.file.getFileList(hashValue);
      assert.deepEqual(existent, [ 'e62d28dd31fc4d1e92a81e7ae5be3cc6-0' ]);
    });
  });


  // describe('POST /api/uploadChunk - handleUpload function ', () => {
  //   it('上传成功', async () => {
  //     app.mockCsrf();
  //     return app.httpRequest()
  //       .post('/api/uploadChunk');
  //     // .attach('')
  //   });
  //   it('上传失败', async () => {
  //     const result = await ctx.service.file.handleUpload(ctx.req);
  //   });
  // });

  // describe('handleMerge function', () => {
  //   it('合并成功', async () => {
  //   });
  //   it('合并失败', async () => {
  //   });
  // });

});
