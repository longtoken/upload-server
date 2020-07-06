import * as assert from 'assert';
import { app } from 'egg-mock/bootstrap';
// import * as path from 'path';
describe('test/app/controller/file.test.ts', () => {
	describe('api/checkChunk', () => {
		// 文件不存在的情况
		it('should GET / file nonExist', async () => {
			const testHash = 'e62d28dd31fc4d1e92a81e7ae5be3cc6';
			const result = await app.httpRequest()
				.get('/api/checkChunk')
				.query({ fileName: '归档 2.zip', fileMd5Val: testHash })
				.expect(200);
			assert.deepEqual(result.body, { hash: testHash, fileExist: false, chunkList: [] });
		});
		// 文件存在的情况
		it('should GET / file exist', async () => {
			const testHash = '65f64a53840c8c0a71c28ef3d6c57cc5';
			const result = await app.httpRequest()
				.get('/api/checkChunk')
				.query({ fileName: 'xx.txt', fileMd5Val: testHash })
				.expect(200);
			assert.deepEqual(result.body, { hash: testHash, fileExist: true });
		});
	});
	// describe('api/uploadChunk', () => {
	// 	it('should POST / file upload', async (done) => {
	// 		await app.httpRequest()
	// 			.post('/api/uploadChunk')
	// 			.field('Content-Type', 'multipart/form-data')
	// 			.field('md5AndFileNo', 'a44c1652b7e4a8314624640021197fd3-18')
	// 			.field('fileName', 'xx.zip')
	// 			.field('fileHash', 'a44c1652b7e4a8314624640021197fd3')
	// 			.attach('chunk', path.resolve(__dirname, '../public/uploads/a44c1652b7e4a8314624640021197fd3-18'))
	// 			.expect(200)
	// 			.end(function(err, res) {
	// 				if (err) return err;
	// 				assert.deepEqual(res.body, { message: 'upload success' });
	// 				done();
	// 			});
	// 	});
	// });
});
