# egg断点续传
### 技术栈
前端用了React，后端则是EggJs，都用了TypeScript编写。
### 断点续传实现原理
断点续传就是在上传一个文件的时候可以暂停掉上传中的文件，然后恢复上传时不需要重新上传整个文件。<br>
该功能实现流程是先把上传的文件进行切割，然后把切割之后的文件块发送到服务端，发送完毕之后通知服务端组合文件块。<br>
其中暂停上传功能就是前端取消掉文件块的上传请求，恢复上传则是把未上传的文件块重新上传。需要前后端配合完成。
### 前端
   前端主要分为：切割文件、获取文件MD5、上传切割后的文件块、合并文件、暂停和恢复上传等功能。
+ 切割文件：这个功能点在整个断点续传中属于比较重要的一环，这里仔细说明下。我们用ajax上传一个大文件用的时间会比较长，在上传途中如果取消掉请求，那在下一次上传时又要重新上传整个文件。而通过把大文件分解成若干个文件块去上传，这样在上传中取消请求，下一次上传就只需要上传其他没上传成功的文件块(不用传整个文件)。

这里把文件块放入一个fileChunkList数组，方便后面去获取文件的MD5、上传文件块等。
```
// 使用HTML5的file.slice对文件进行切割，file.slice方法返回Blob对象
let start = 0;
while (start < file.size) {
    fileChunkList.push({ file: file.slice(start, start + CHUNK_SIZE) });
    start += CHUNK_SIZE;
}
```

+ 获取文件MD5：我们不能通过文件名来判断服务端是否存在上传的文件，因为用户上传的文件很可能会有重名的情况。所以应该通过文件内容来区分，这样就需要获取文件的MD5。<br>

使用spark-md5模块获取文件的md5。模块详情点击[这里](http)
```
// 部分代码展示
let spark = new SparkMD5.ArrayBuffer();
let fileReader = new FileReader();
fileReader.onload = e => {
    if (e.target && e.target.result) {
        count++;
        spark.append(e.target.result as ArrayBuffer);
    }
    if (count < totalCount) {
        loadNext();
    } else {
        resolve(spark.end());
    }
};
function loadNext() {
    fileReader.readAsArrayBuffer(fileChunkList[count].file);
}
loadNext();
```

+ 上传切割后的文件块：根据前面的fileChunkList数组，使用FormData上传文件块。
```
// 部分代码展示
Axios.post(uploadChunkPath, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    cancelToken: source.token,
}).then(()=>{
    // ...
})
```

+ 合并文件：就是等所有文件块上传成功后发送ajax通知服务端，让服务端把文件块进行合并。
```
// 部分代码展示
Axios.get(mergeChunkPath, {
    params: {
        fileHash: targetFile,
        fileName,
    },
})
```
+ 暂停功能：把上传文件块的请求放到一个数组里，请求完成的则从数组中删除；点击暂停的时候把数组里所有的请求暂停。
```
/* 文件块请求放入数组 */
const source = CancelToken.source();
// ...
axiosList.push(source);

/* 暂停请求 */
axiosList.forEach((item) => item.cancel('abort'));
axiosList.length = 0;
message.error('上传暂停');
```
+ 恢复上传：去服务端查询已经上传的文件块有哪些，然后上传没有上传成功的文件块。
```
// 部分代码展示
let uploadedFileInfo = await getFileChunks(this.fileName, this.fileMd5Value);
if (this.handleUploaded(uploadedFileInfo.fileExist) && uploadedFileInfo.chunkList) {
    this.uploadChunks(this.chunkListInfo, uploadedFileInfo.chunkList, this.fileName);
}
```

### 后端
先说下大致编写过程，在egg项目中的app目录里面找到router.ts文件定义路由，定义路由需要传入controller方法，controller方法主要对请求参数进行处理，调用service 方法处理业务，然后返回结果。<br>
主要的功能是对针对文件的操作，比如使用fs-extra模块获取文件信息、使用formidable模块解析上传的文件等。
+ 环境搭建<br>
egg文档蛮全的，可以直接参考egg的文档。这里就简单说下搭建步骤。[egg文档](https://eggjs.org/zh-cn/)<br>
首先执行`npm init egg --type=ts`安装egg项目，然后找到router.ts文件定义一些路由，比如处理上传的接口`router.post('api/uploadChunk', controller.file.upload);`接着分别在controller目录跟service目录下创建对应文件，比如`cd app/controller/ && touch file.ts`；最后在对应的文件编写具体业务。

+ 接口编写<br>
   主要有三个接口，分别是checkChunk、uploadChunk接口和mergeChunk接口。
   + checkChunk接口：首先判断上传的文件是否存在，如果存在则告诉前端文件已经上传成功。文件不存在则再查看存放文件块的目录是否存在，目录存在则把上传成功的文件块列表返回给前端。目录不存在则把空列表返回给前端。
    ```
    if (fileInfo.isFileExist) {
      checkResponse.fileExist = true;
    } else {
      const fileList = await ctx.service.file.getFileList(fileMd5Val);
      checkResponse.chunkList = fileList;
      checkResponse.fileExist = false;
    }
    ctx.body = checkResponse;
    ```
   + uploadChunk接口：使用formidable模块解析上传的文件块，把上传的文件块统一放到一个目录，用文件的md5给目录命名。
    ```
    import { IncomingForm } from 'formidable';
    const form = new IncomingForm();
    form.parse(req, async (err, fields, file) => {
        if (err) return err;
        const md5AndFileNo = fields.md5AndFileNo;
        const fileHash = fields.fileHash;
        const chunkFolder = resolve(this.config.uploadsPath, fileHash as string);
        if (!existsSync(chunkFolder)) {
            await mkdirs(chunkFolder);
        }
        move(file.chunk.path, resolve(`${chunkFolder}/${md5AndFileNo}`));
    });
    ```
   + mergeChunk接口：通过文件md5，把对应目录里面的文件块用createReadStream跟createWriteStream组合成一个文件。最后在文件组合完成之后删除文件块目录。
    ```
    const readStream = createReadStream(path);
    readStream.on('end', () => {
      unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
    ```
+ 单元测试<br>
   测试文件都放在test目录里，同时必须用.test.ts结尾。<br>
   编写案例：首先创建测试文件`cd test/app/controller && touch file.test.ts`，然后在file.test.ts里编写测试代码，最后执行npm run test-local运行测试案例。<br>
   使用app.httpRequest()可以发送HTTP请求，然后传入参数，验证返回值是否跟预期相等。
    ```
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
    });
    ```
+ 运行<br>
使用`npm i`安装依赖，本地环境启动使用`npm run dev`即可。生产环境则先把ts编译成js，执行`npm run tsc`，然后执行`npm run start`启动服务。
### 代码地址
[前端代码](https://github.com/longtoken/upload-front)
[后端代码](https://github.com/longtoken/upload-server)
### 总结
关于断点续传，这里的代码只是一个基础功能实现，仅供参考。具体需求需要具体分析啦。


