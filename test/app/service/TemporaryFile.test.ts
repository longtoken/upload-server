import * as assert from 'assert';
import { Context } from 'egg';
import { app } from 'egg-mock/bootstrap';

describe('test/app/service/Temporary.test.js', () => {
  let ctx: Context;

  before(async () => {
    ctx = app.mockContext();
  });

  it('TemporaryFile', async () => {
    // const result = await ctx.service.temporaryFile.obsolete();
    assert.equal('1', 1);
    console.log(ctx);
  });


});
