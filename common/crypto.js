const NodeRSA = require('node-rsa');
const { config } = require('../common/config')

module.exports = {
    encrypt: (key, msg) => {
        return new NodeRSA(key).encrypt(msg, 'base64');
    },
    decrypt: (msg) => {
        private_key = new config().context()['user']['prv_key'];
        return new NodeRSA(private_key).decrypt(msg, 'utf8');
    }
}