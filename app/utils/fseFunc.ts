import { stat, statSync, readdir, Stats, createReadStream, unlinkSync, WriteStream } from 'fs-extra';
import * as path from 'path';
import { Service } from 'egg';

export interface CusError {
  isException: boolean;
}
export function fileStat(filePath: string): Promise<Stats | CusError> {
  return new Promise(resolve => {
    stat(filePath, (err, stats) => {
      // 文件不存在
      if (err && err.code === 'ENOENT') {
        resolve({ isException: true });
      } else {
        resolve(stats);
      }
    });
  });
}

export function listDir(path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    readdir(path, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      if (data && data.length > 0 && data[0].indexOf('.') === 0) {
        data.splice(0, 1);
      }
      resolve(data);
    });
  });
}

export function obsoleteFile(this: Service, files: string[]) {
  const timeNow = Date.now();
  return files.map(filePath => {
    const staticPath = path.resolve(this.config.uploadsPath, filePath);
    return { file: statSync(staticPath), pathName: staticPath };
  }).filter(val => {
    return timeNow - val.file['birthtimeMs'] > this.config.TIMEOUT_MS;
  }).map(item => {
    return item.pathName;
  });
}

export function delFiles(files: string[]) {
  files.forEach(item => unlinkSync(item));
}

export function pipeStream(path: string, writeStream: WriteStream) {
  return new Promise(resolve => {
    const readStream = createReadStream(path);
    readStream.on('end', () => {
      unlinkSync(path);
      resolve();
    });
    readStream.pipe(writeStream);
  });
}
