import { Service } from 'egg';
import { uploadsPath } from '../utils/allPath';
import { listDir, obsoleteFile, delFiles } from '../utils/fsFunc';
export default class TemporaryFile extends Service {
  async obsolete() {
    const files = await listDir(uploadsPath);
    if (files.length > 0) {
      delFiles(obsoleteFile(files));
    }
  }
}
