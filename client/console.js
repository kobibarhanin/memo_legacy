const Web3 = require("web3");
const { setIntervalAsync } = require('set-interval-async/dynamic')


// remember to start ganache dev server
const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);


const Memo = require("../ethereum/build/Memo.json");
const utils = require("../utils");

let accounts;

// parse the activating account from args 
// account = index for local address usage, e.g - 0,1,.. in the ganache server
// var account = parseInt(process.argv.slice(2)[0]);

async function deploy_session(){
    accounts = await web3.eth.getAccounts();
    memo = await utils.deploy(web3, provider, Memo, accounts[0]);    
}

async function get_contract(address){
    accounts = await web3.eth.getAccounts();
    memo = await utils.get_contract(web3, Memo, address)
}

async function run() {
    try {
    //   await deploy_session();
    //   console.log("contract is at: " + memo._address);
        await get_contract('0xfBb7df7FBDC89E58884DEaa32366a2FCcDB4E200');
    
        // await memo.methods.sendMemo(accounts[1], "Mate the dog").send({
        //     from: accounts[0],
        //     gas: '1000000'
        // });

      const rv = await memo.methods.getMemo(0).call({from: accounts[1]});
      console.log('res = ' + rv.content);
    }
    catch(e) {
      console.log('Catch an error: ', e)
    }
  }

run();
