import { Application } from 'egg';
export default (app: Application) => {
  const { controller, router } = app;
  const api = '/api';
  router.get('/', controller.home.index);
  router.get(`${api}/checkChunk`, controller.file.list);
  router.post(`${api}/uploadChunk`, controller.file.upload);
  router.get(`${api}/mergeChunk`, controller.file.merge);
};
