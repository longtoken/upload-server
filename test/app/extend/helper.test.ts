import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';

describe('helper test', () => {
	it('get file suffix', async () => {
		const ctx = app.mockContext();
		assert(ctx.helper.getSuffix('test.txt') === '.txt');
	});
});
