import { Controller } from 'egg';
interface QueryParams {
  fileName: string;
  fileMd5Val: string;
  [props: string]: any;
}
interface CheckRes {
  hash: string;
  fileExist?: boolean;
  chunkList?: string[];
}
/**
 * 通过文件名检查上传的文件是否存在，如果存在直接返回上传完毕；不存在则检查文件对应的文件夹是否存在，存在则返回目录里面的所有文件；不存在则创建目录
 */
export default class FileController extends Controller {
  public async list() {
    const { ctx } = this;
    const { fileName, fileMd5Val }: QueryParams = ctx.query;
    let fileSuffix: string = ctx.helper.getSuffix(fileName);
    let fileInfo = ctx.service.file.getFileInfo(fileMd5Val, fileSuffix);
    let checkResponse: CheckRes = { hash: fileMd5Val };
    if (fileInfo.isFileExist) {
      checkResponse.fileExist = true;
    } else {
      let fileList = await ctx.service.file.getFileList(fileMd5Val);
      checkResponse.chunkList = fileList;
      checkResponse.fileExist = false;
    }
    ctx.body = checkResponse;
  }
  async upload() {
    const { ctx } = this;
    let uploadRes = await this.service.file.handleUpload(ctx.req);
    ctx.body = uploadRes;
  }
  async merge() {
    const { ctx } = this;
    await this.service.file.handleMerge(ctx.query.fileHash, ctx.query.fileName);
    ctx.body = { message: 'merge success', hash: ctx.query.fileHash };
  }
}

