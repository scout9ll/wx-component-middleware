import ComponentService from './helper/component-service';
import tokenStore from './tokenStore/index';
import {ClientOpts} from 'redis';
import xmlMiddleWare from './helper/xml.koa-middleware';
interface WX_C_Config {
  componentAppId: string;
  componentAppSecret: string;
  token: string;
  encodingAESKey: string;
}

export interface wxc extends ComponentService {}

export default function wxComponentService(app: any,
    wxConfig: WX_C_Config,
    storeConfig?: ClientOpts,
) {
  let store: any = new tokenStore.MemoryStore();

  if (storeConfig) {
    store = new tokenStore.RedisStore(storeConfig);
  }

  const wxcCtx = new ComponentService(wxConfig, store);
  const wxcMiddleware = async (ctx, next) => {
    ctx.wxc = wxcCtx;
    await next();
  };
  app.use(xmlMiddleWare);
  app.use(wxcMiddleware);
}
