const axios = require('axios');
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
     * @param {String} content
     * @returns {Promise}
     */
    async send(content) {
        const datas = [];
        const errors = [];
        for (let key of this.keys) {
            try {
                const data = await this.#sendMsg(key, content);
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
     * @param {String} content
     * @returns {Promise}
     */
    async #sendMsg(key, content) {
        return axios.post(`${this.baseUrl}${key}`, {
            msgtype: 'markdown',
            markdown: {
                content
            }
        });
    }
}

exports.WeiChat = WeiChat;
