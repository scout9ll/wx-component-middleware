import fetch from 'node-fetch';

function appendComponentTokenToUrl(baseUrl: string, token: string) {
  return baseUrl + `?component_access_token=${token}`;
}

export async function jsonPost(url: string, data: any) {
  url = appendComponentTokenToUrl(url, data.component_access_token);
  const res = await fetch(url, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {'Content-Type': 'application/json'},
  });
  const jsonRes = await res.json();
  if (jsonRes.errcode) {
    const err: any = new Error(JSON.stringify(jsonRes));
    err.status = 501;
    throw err;
  }
  return jsonRes;
}
