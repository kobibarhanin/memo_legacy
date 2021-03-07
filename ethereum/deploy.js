const fs = require('fs-extra');
const homedir = require('os').homedir();
const Web3 = require('web3-eth');
const Memo = require("./build/Memo.json");

const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

fs.ensureDirSync(homedir+'/.memo');

(async ()=>{
    accounts = await web3.getAccounts();
    instance = await new web3.Contract(JSON.parse(Memo.interface))
                             .deploy({ data: Memo.bytecode, arguments: null })
                             .send({ from: accounts[0], gas: '1000000' });
    instance.setProvider(provider);
    fs.writeFileSync(homedir + "/.memo/contract_address", instance._address);
    console.log("contract deployed at: " + instance._address);
})();
