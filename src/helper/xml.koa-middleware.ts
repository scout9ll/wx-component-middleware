
export default async function xmLMiddleWare(ctx, next) {
  if (ctx.request.header['content-type']?.includes('xml')) {
    const xml: string = await new Promise((resolve) => {
      let data = '';
      ctx.req.on('data', (chunk) => data += chunk);
      ctx.req.on('end', () => resolve(data));
    });
    ctx.request.xml = xml;
  }
  await next();
}
