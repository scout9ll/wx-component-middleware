## Usage

```js
import Koa from "koa";
import wxComponentService from "koa-wxc";

const app = new Koa();

wxComponentService(
  app,
  // weixin component config
  {
    componentAppSecret: "****",
    componentAppId: "****",
    token: "****",
    encodingAESKey: "****",
  },
  // redis config
  {
    host: "your_redis_host",
    port: 6379,
    db: 20,
    password: "****",
  }
);

// register route for revicing component_ticket
import KoaRouter from "koa-router";
const router = new KoaRouter();
router.post("/notify", async (ctx, next) => {
  const wxc = ctx.wxc;
  const ticket = await wxc.decodeTicket(ctx.request.xml);
  console.log(ticket);
  ctx.body = "success";
});

app.use(router.routes());

app.listen(8008);
```
