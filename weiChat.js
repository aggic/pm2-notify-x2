const axios = require('axios');
const crypto = require('crypto');
const concat = require('lodash.concat');

/**
 * @typedef {Object} WeiCharConf
 * @property {String} weiChatBotKeys
 *
 * @typedef {Object} WeiCharSenderParams
 * @property {Boolean} isAll
 * @property {Buffer|String} img
 */

class WeiChat {
    /** @type {String} */
    baseUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=';

    /** @param {WeiCharConf} conf */
    constructor(conf) {
        this.keys = conf.weiChatBotKeys.split(',');
    }
    /**
     * @param {Buffer|String} buf
     * @returns {String}
     */
    #md5Buffer(buf) {
        if (!buf instanceof Buffer && typeof buf != 'string') throw new Error('参数必须是buffer或字符串');
        let hash = crypto.createHash('md5');
        hash.update(buf);
        return hash.digest('hex');
    }
    /**
     * @param {WeiCharSenderParams} params
     * @returns {Promise}
     */
    async send(params) {
        const datas = [];
        const errors = [];
        for (let key of this.keys) {
            try {
                const data = await this.#sendMsg(key, params);
                datas.push(data.data);
            } catch (err) {
                errors.push(err.toString());
            }
        }
        return new Promise((resolve, reject) => {
            /** If any robot sends successfully, it will be regarded as successful */
            if (datas.length > 0) {
                resolve(concat([], errors, datas));
                return;
            }
            /** Failure of all robots is considered as failure */
            if (errors.length === this.keys.length) {
                reject(concat([], errors, datas));
            }
        });
    }
    /**
     * @param {String} key
     * @param {WeiCharSenderParams} params
     * @returns {Promise}
     */
    async #sendMsg(key, params) {
        const list = params.isAll ? ['@all'] : [];
        return axios.post(`${this.baseUrl}${key}`, {
            msgtype: 'image',
            image: {
                base64: params.img.toString('base64'),
                md5: this.#md5Buffer(params.img)
            },
            mentioned_list: list
        });
    }
}

exports.WeiChat = WeiChat;
