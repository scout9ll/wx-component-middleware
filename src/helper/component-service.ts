import {
  fetchComponentAccessToken,
  fetchPreAuthCode,
  fetchAppAccessToken,
  fetchAppAccessTokenByRT,
  fetchAuthorizerList,
} from './componentAPI';
import {Store} from '../tokenStore/types';
import WxMsgCrypt from './utils/wxMsgCrypt';
import {xml2js} from 'xml-js';

export default class ComponetService {
  componentAppId: string;
  componentAppSecret: string;
  token: string;
  encodingAESKey: string;
  constructor(componetConfig: any, public store: Store) {
    this.store = store;
    Object.assign(this, componetConfig);
  }

  async decodeTicket(body) {
    const wxMsgCrypt = new WxMsgCrypt({
      appid: this.componentAppId,
      token: this.token,
      encodingAESKey: this.encodingAESKey,
    });
    const encryptData = (xml2js(body, {compact: true}) as any).
        xml.Encrypt._cdata;
    const decodedXml = wxMsgCrypt.decode(encryptData);
    const decodedTicket = (xml2js(decodedXml, {compact: true}) as any).
        xml.ComponentVerifyTicket._cdata;
    await this.setComponentVerifyTicket(decodedTicket);
    return decodedTicket;
  }

  async setComponentVerifyTicket(data: any) {
    await this.store.set('component_verify_ticket', data);
  }
  async getComponentVerifyTicket() {
    return this.store.get('component_verify_ticket');
  }

  async getComponentAccessToken() {
    const key = `component_access_token`;
    const componentAccessToken = await this.store.get(key);

    if (componentAccessToken) return componentAccessToken;
    const component_verify_ticket = await this.getComponentVerifyTicket();

    // eslint-disable-next-line max-len
    const {component_access_token: newComponentAccessToken, expires_in} = await fetchComponentAccessToken({
      component_appid: this.componentAppId,
      component_appsecret: this.componentAppSecret,
      component_verify_ticket,
    });


    await this.store.set(key, newComponentAccessToken, expires_in);
    return newComponentAccessToken;
  }

  async getPreAuthCode() {
    const key = `component_pre_code`;
    const componentPreCode = await this.store.get(key);
    if (componentPreCode) return componentPreCode;
    const component_access_token = await this.getComponentAccessToken();
    const {pre_auth_code: newAuthCode, expires_in} = await fetchPreAuthCode({
      component_appid: this.componentAppId,
      component_access_token,
    });
    await this.store.set(key, newAuthCode, expires_in);
    return newAuthCode;
  }

  async getAuthorizationUrl(redirectUri: string, auth_type?: number) {
    const preAuthCode = await this.getPreAuthCode();
    // eslint-disable-next-line max-len
    const url = `https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=${this.componentAppId}&pre_auth_code=${preAuthCode}&redirect_uri=${redirectUri}&auth_type=${auth_type}`;
    return url;
  }

  async setAppAccessToken(authorization_code: string) {
    const component_access_token = await this.getComponentAccessToken();
    const {
      authorizer_access_token,
      authorizer_appid,
      authorizer_refresh_token,
      expires_in,
    }: any = await fetchAppAccessToken({
      component_appid: this.componentAppId,
      component_access_token,
      authorization_code,
    });
    const RTkey = `RT:${authorizer_appid}`;
    const ATkey = `AT:${authorizer_appid}`;
    this.store.set(RTkey, authorizer_refresh_token);
    this.store.set(ATkey, authorizer_access_token, expires_in);
  }

  async getAppAcccessToken(authorizer_appid: string) {
    const key = `component_pre_code`;
    const ATkey = `AT:${authorizer_appid}`;
    const RTkey = `RT:${authorizer_appid}`;
    const appAcccessToken = await this.store.get(ATkey);
    const authorizer_refresh_token = await this.store.get(RTkey);
    if (appAcccessToken) return appAcccessToken;
    const component_access_token = await this.getComponentAccessToken();
    const {authorizer_access_token: newAT, expires_in} = await fetchAppAccessTokenByRT({
      component_appid: this.componentAppId,
      component_access_token,
      authorizer_appid,
      authorizer_refresh_token,

    });
    await this.store.set(key, newAT, expires_in);
    return newAT;
  }

  async getAuthorizerList(offset=0, count=500) {
    const component_access_token = await this.getComponentAccessToken();
    return fetchAuthorizerList({
      component_appid: this.componentAppId,
      component_access_token,
      offset,
      count,
    });
  }
}
