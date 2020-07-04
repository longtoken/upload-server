import { Service } from 'egg';
import { listDir, obsoleteFile, delFiles } from '../utils/fseFunc';
export default class TemporaryFile extends Service {
	obsoleteFile = obsoleteFile;
	async obsolete() {
		const files = await listDir(this.config.uploadsPath);
		if (files.length > 0) {
			delFiles(this.obsoleteFile(files));
		}
	}
}
