import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

import { resolve } from 'path';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1592814719508_6633';

  // add your egg config in here
  // config.middleware = [];

  // custom
  config.TIMEOUT_MS = 2592000000;//30天
  config.uploadsPath = resolve(__dirname, '../app/public/uploads');
  config.API = '/api';
  // cors
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: ['http://localhost:3000'], // 不能有多余的下划线
  };

  config.cors = {
    origin: 'http://localhost:3000',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    credentials: true,
  };

  // add your special config in here
  // const bizConfig = {
  //   sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  // };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    // ...bizConfig,
  };
};
