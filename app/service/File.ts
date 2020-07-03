import { Service } from 'egg';
import { uploadsPath } from '../utils/allPath';
import { fileStat, listDir, CusError, pipeStream } from '../utils/fsFunc';
import { IncomingForm } from 'formidable';
import { resolve, join } from 'path';
import { existsSync, mkdirs, move, Stats, readdir, createWriteStream, rmdirSync } from 'fs-extra';
import { IncomingMessage } from 'http';

interface FileStatus {
  isFileExist: boolean;
  name: string;
}
/**
 * file Service
 */
export default class File extends Service {
  getFileInfo(hash: string, suffix: string) {
    let fileStatus: FileStatus = { isFileExist: false, name: hash };
    let checkFilePath = join(uploadsPath, `${hash}${suffix}`);
    if (existsSync(checkFilePath)) {
      fileStatus.isFileExist = true;
    } else {
      fileStatus.isFileExist = false;
    }
    return fileStatus;
  }
  async getFileList(hash: string) {
    let result: string[] = [];
    let checkFolderPath = join(uploadsPath, hash);
    let fileStatInfo = await fileStat(checkFolderPath);
    if (!(<CusError>fileStatInfo).isException) {
      if ((<Stats>fileStatInfo).isDirectory()) {
        result = await listDir(checkFolderPath);
      }
    }
    return result;
  }
  handleUpload(req: IncomingMessage) {
    return new Promise((res) => {
      const form = new IncomingForm();
      form.parse(req, async (err, fields, file) => {
        if (err) return err;
        let md5AndFileNo = fields.md5AndFileNo;
        let fileHash = fields.fileHash;
        let chunkFolder = resolve(uploadsPath, fileHash as string);
        if (!existsSync(chunkFolder)) {
          await mkdirs(chunkFolder);
        }
        move(file.chunk.path, resolve(`${chunkFolder}/${md5AndFileNo}`));
        res({ message: 'upload success' });
      });
    });
  }

  async handleMerge(hash: string, fileName: string) {
    const chunkDir = resolve(uploadsPath, hash);
    const chunkPaths = await readdir(chunkDir);
    const suffix = this.ctx.helper.getSuffix(fileName);
    const writeFile = `${chunkDir}${suffix}`;
    chunkPaths.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
    await Promise.all(
      chunkPaths.map((chunkPath) =>
        pipeStream(
          resolve(chunkDir, chunkPath),
          // 指定位置创建可写流
          createWriteStream(writeFile)
        )
      )
    );
    rmdirSync(chunkDir); // 合并后删除保存切片的目录
  }
}
