import * as crypto from 'crypto';

class PKCS7Crypt {
  block_size = 32;

  decode(buf: Buffer) {
    const padSize = buf[buf.length - 1]; // 最后1字节记录着填充的数据大小
    return buf.slice(0, buf.length - padSize); // 提取原数据
  }

  /**
   * 按 PKCS#7 的方式填充数据结尾
   * @param {Buffer} buf 待填充的数据
   */
  encode(buf: Buffer) {
    const padSize = this.block_size - (buf.length % this.block_size); // 计算填充的大小。
    const fillByte = padSize; // 填充的字节数据为填充的大小
    const padBuf = Buffer.alloc(padSize, fillByte); // 分配指定大小的空间，并填充数据
    return Buffer.concat([buf, padBuf]); // 拼接原数据和填充的数据
  }
}

class PrpEncrypt {
  iv: Buffer;
  key: Buffer;
  appid: string;
  token: string;
  ALGORITHM = 'aes-256-cbc'; // 使用的加密算法
  MSG_LENGTH_SIZE = 4; // 存放消息体尺寸的空间大小。单位：字节
  RANDOM_BYTES_SIZE = 16; // 随机数据的大小。单位：字节
  customCrypt: PKCS7Crypt;
  constructor(config: {
    appid: string;
    token: string;
    encodingAESKey: string;
    customCrypt?: PKCS7Crypt;
  }) {
    this.appid = config.appid;
    this.key = Buffer.from(config.encodingAESKey + '=', 'base64'); // 解码密钥
    this.iv = this.key.slice(0, 16);
    this.token = config.token;
    this.customCrypt = config.customCrypt || new PKCS7Crypt();
  }
  encode(msg: string) {
    const {appid, key, iv} = this;
    const randomBytes = crypto.randomBytes(this.RANDOM_BYTES_SIZE); // 生成指定大小的随机数据

    const msgLenBuf = Buffer.alloc(this.MSG_LENGTH_SIZE); // 申请指定大小的空间，存放消息体的大小
    const offset = 0; // 写入的偏移值
    msgLenBuf.writeUInt32BE(Buffer.byteLength(msg), offset); // 按大端序（网络字节序）写入消息体的大小

    const msgBuf = Buffer.from(msg); // 将消息体转成 buffer
    const appIdBuf = Buffer.from(appid); // 将 APPID 转成 buffer

    // 将16字节的随机数据、4字节的消息体大小、若干字节的消息体、若干字节的APPID拼接起来
    let totalBuf = Buffer.concat([randomBytes, msgLenBuf, msgBuf, appIdBuf]);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv); // 创建加密器实例
    cipher.setAutoPadding(false); // 禁用默认的数据填充方式

    totalBuf = this.customCrypt.encode(totalBuf); // 使用自定义的数据填充方式
    const encryptedBuf = Buffer.concat([cipher.update(totalBuf), cipher.final()]); // 加密后的数据

    return encryptedBuf.toString('base64'); // 返回加密数据的 base64 编码结果
  }

  /**
   * 解密消息
   * @param {string} encryptedMsg 待解密的消息体
   */
  decode(encryptedMsg: string) {
    const {key, iv} = this;
    const encryptedMsgBuf = Buffer.from(encryptedMsg, 'base64'); // 将 base64 编码的数据转成 buffer

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv); // 创建解密器实例
    decipher.setAutoPadding(false); // 禁用默认的数据填充方式
    let decryptedBuf = Buffer.concat([
      decipher.update(encryptedMsgBuf),
      decipher.final(),
    ]); // 解密后的数据

    decryptedBuf = this.customCrypt.decode(decryptedBuf); // 去除填充的数据

    // 根据指定偏移值，从 buffer 中读取消息体的大小，单位：字节
    const msgSize = decryptedBuf.readUInt32BE(this.RANDOM_BYTES_SIZE);
    const msgBufStartPos = this.RANDOM_BYTES_SIZE + this.MSG_LENGTH_SIZE; // 消息体的起始位置
    const msgBufEndPos = msgBufStartPos + msgSize; // 消息体的结束位置

    const msgBuf = decryptedBuf.slice(msgBufStartPos, msgBufEndPos); // 从 buffer 中提取消息体

    return msgBuf.toString(); // 将消息体转成字符串，并返回数据
  }

  genSign(params: any) {
    const {token} = this;
    const {timestamp, nonce, encrypt} = params;

    const rawStr = [token, timestamp, nonce, encrypt].sort().join(''); // 原始字符串
    const signature = crypto.createHash('sha1').update(rawStr).digest('hex'); // 计算签名

    return signature;
  }
}

export default PrpEncrypt;
