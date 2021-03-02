// node modules
const Web3 = require("web3");
const fs = require('fs-extra');

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
        // TODO: take public key and alias from user
        await memo.methods.enroll('0x12345678', 'myalias').send({
          from: source,
          gas: '1000000'
        });
      }
      else if (args[0] == 'getUserKey'){
        rv = await memo.methods.getUserKey(source).call({from: source});
        console.log('getUserKey: ' + rv);
      }
      else if (args[0] == 'sendMsg'){
        await memo.methods.sendMemo(target, args[1]).send({
          from: source,
          gas: '1000000'
        });
      }
      else if (args[0] == 'getMsg'){
        rv = await memo.methods.getMemo(parseInt(args[1])).call({from: target});
        console.log('getMsg: ' + rv.content);
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
