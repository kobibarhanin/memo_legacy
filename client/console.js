// node modules
const Web3 = require("web3");
const fs = require('fs-extra');
const NodeRSA = require('node-rsa');

// remember to start ganache dev server
const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

// load the contract
const Memo = require("../ethereum/build/Memo.json");
const utils = require("../utils");

async function deploy_contract(accounts){
    memo = await utils.deploy(web3, provider, Memo, accounts[0]);    
    console.log("contract deployed at: " + memo._address);
    fs.writeFileSync("contract_address", memo._address);
    return memo;
}

async function get_contract(address=null){
  if (!address){
    address = fs.readFileSync("contract_address", 'utf8');
  }
  return await utils.get_contract(web3, Memo, address)
}

async function run() {
    try {
      
      // parse input args
      args = process.argv.slice(2);
      
      // get provider account / accounts
      accounts = await web3.eth.getAccounts();

      source = accounts[0]
      target = accounts[1]

      if (args[0] == 'deploy')
        memo = await deploy_contract(accounts);
      else
        memo = await get_contract();

      if (args[0] == 'enroll'){
        alias = args[1];

        const key = new NodeRSA({b: 512});

        pk_raw = key.exportKey('public');
        fs.writeFileSync("private_key_"+alias, key.exportKey('private'));
        
        const buf = Buffer.from(pk_raw, 'ascii');
        pk_enc = '0x' + buf.toString('hex');
        await memo.methods.enroll(pk_enc, alias).send({
          from: alias=='kobi' ? source : target,
          gas: '1000000' // max gas allowed by ganache server
        });
        console.log('user enrolled successfully')
      }
      else if (args[0] == 'getUserKey'){
        rv = await memo.methods.getUserKey(source).call({from: source});
        const buf = Buffer.from(rv.slice(2), 'hex');
        pk_dec = buf.toString('ascii');
        console.log('getUserKey: ' + pk_dec);
      }
      else if (args[0] == 'sendMsg'){

        rv = await memo.methods.getUserKey(target).call({from: source});
        const buf = Buffer.from(rv.slice(2), 'hex');
        pk_dec = buf.toString('ascii');
        const key = new NodeRSA(pk_dec);
        const encrypted = key.encrypt(args[1], 'base64');

        await memo.methods.sendMemo(target, encrypted).send({
          from: source,
          gas: '1000000'
        });
      }
      else if (args[0] == 'getMsg'){
        rv = await memo.methods.getMemo(parseInt(args[1])).call({from: target});
        if (rv.content == 'empty cell'){
          console.log('empty cell')
          return
        }
        private_key = fs.readFileSync('private_key_mate', 'utf8')
        const key = new NodeRSA(private_key);
        const decrypted = key.decrypt(rv.content, 'utf8');
        console.log('getMsg: ' + decrypted);
      }
      else if (args[0] == 'getCnt'){
        rv = await memo.methods.getMemoCount(target).call();
        console.log('getCnt: ' + rv);
      }

    }
    catch(e) {
      console.log('Catch an error: ', e)
    }
  }

run();
