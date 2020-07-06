import { Application } from 'egg';
export default (app: Application) => {
  const { controller, router } = app;
  router.get('/', controller.home.index);
  router.get(`${app.config.API}/checkChunk`, controller.file.list);
  router.post(`${app.config.API}/uploadChunk`, controller.file.upload);
  router.get(`${app.config.API}/mergeChunk`, controller.file.merge);
};
