// This file is created by egg-ts-helper@1.25.8
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportFile from '../../../app/service/File';
import ExportTemporaryFile from '../../../app/service/TemporaryFile';

declare module 'egg' {
  interface IService {
    file: AutoInstanceType<typeof ExportFile>;
    temporaryFile: AutoInstanceType<typeof ExportTemporaryFile>;
  }
}
