/* eslint-disable max-len */
import {jsonPost} from './utils/wxcRequest';


/**
 * 获取第三方平台的access token
 */

export const fetchComponentAccessToken = async (data: {
  component_appid: string;
  component_appsecret: string;
  component_verify_ticket: string;
}) => {
  const url = 'https://api.weixin.qq.com/cgi-bin/component/api_component_token';
  const res = await jsonPost(url, data);
  return res;
};

/**
 * 获取第三方平台预授权码
 */
export const fetchPreAuthCode = async (data: {
  component_appid: string;
  component_access_token: string;
}) => {
  const url = `https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode`;
  const res = await jsonPost(url, data);
  return res;
};

/**
 * 获取授权方的access token
 */
export const fetchAppAccessToken = async (data: {
  component_appid: string;
  component_access_token: string;
  authorization_code: string;
}) => {
  const url = `https://api.weixin.qq.com/cgi-bin/component/api_query_auth`;
  const res = await jsonPost(url, data);
  return res.authorization_info;
};


/**
 * 根据authorizer_refresh_token获取授权方的access token
 */
export const fetchAppAccessTokenByRT = async (data: {
  component_appid: string;
  component_access_token: string;
  authorizer_appid: string;
  authorizer_refresh_token: string;
}) => {
  const url = `https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token`;
  const res = await jsonPost(url, data);
  return res;
};


/**
 * 根据authorizer_refresh_token获取授权方的access token
 */
export const fetchAuthorizerList = async (data: {
  component_appid: string;
  component_access_token: string;
  offset: number;
  count: number;
}) => {
  const url = `https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_list`;
  const res = await jsonPost(url, data);
  return res;
};
