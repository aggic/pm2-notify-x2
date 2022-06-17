const axios = require('axios');
const crypto = require('crypto');
const concat = require('lodash.concat');

class DingTalk {
    webhook = 'https://oapi.dingtalk.com/robot/send?access_token=';
    keys;
    secrets;
    constructor(conf) {
        if (!conf) conf = {};
        this.keys = conf.dingTalkBotKeys.split(',');
        this.secrets = conf.dingTalkBotSecrets.split(',');
    }
    async sendMarkDowns(title, text, callback) {
        const datas = [];
        const errors = [];
        for (let i = 0; i < this.keys.length; i++) {
            try {
                const data = await this.#sendMarkDown(title, text, this.keys[i], this.secrets[i]);
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
    async #sendMarkDown(title, text, key, secret) {
        let signStr = '';
        const timeStamp = new Date().getTime();

        const hash = encodeURIComponent(
            crypto
                .createHmac('sha256', secret)
                .update(timeStamp + '\n' + secret)
                .digest('base64')
        );
        signStr = this.webhook + key + '&sign=' + hash + '&timestamp=' + timeStamp;
        return axios.post(signStr, {
            msgtype: 'markdown',
            markdown: {
                title,
                text: text
            }
        });
    }
}
exports.DingTalk = DingTalk;
