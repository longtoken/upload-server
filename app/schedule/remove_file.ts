import { Subscription } from 'egg';

export default class RemoveFile extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      cron: '0 0 18 * * *', // 选一个访问人数较少的时间
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }
  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    this.ctx.service.temporaryFile.obsolete();
  }
}
