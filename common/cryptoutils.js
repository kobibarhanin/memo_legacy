const NodeRSA = require('node-rsa');
const fs = require('fs-extra');
const homedir = require('os').homedir();


function encrypt(key, msg){
    return new NodeRSA(key).encrypt(msg, 'base64');
}
  
function decrypt(msg){
    private_key = fs.readFileSync(homedir+'/.memo/private_key_user0', 'utf8')
    return new NodeRSA(private_key).decrypt(msg, 'utf8');
}

exports.encrypt = encrypt
exports.decrypt = decrypt