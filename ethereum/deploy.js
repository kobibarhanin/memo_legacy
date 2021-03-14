const Web3 = require('web3-eth');
const HDWalletProvider = require('truffle-hdwallet-provider')

const Memo = require("./build/Memo.json");
const { config } = require('../common/config')

mode = process.argv.slice(2)[0];

if (mode == 'local'){
    provider = new Web3.providers.HttpProvider('http://localhost:7545');
} else {
    mnemonic = 'ten jewel message joke radio cushion few worry tiny shock hidden two';
    infura_gw = 'https://rinkeby.infura.io/v3/acd25b1c38534e99abd0f05031d08058';
    provider = new HDWalletProvider(mnemonic, infura_gw);
}

const web3 = new Web3(provider);

(async ()=>{
    accounts = await web3.getAccounts();
    console.log("attempting to deploy contract to: " + mode + " ,from account: " + accounts[0]);
    instance = await new web3.Contract(JSON.parse(Memo.interface))
                             .deploy({ data: Memo.bytecode, arguments: null })
                             .send({ from: accounts[0], gas: '1000000' });
    instance.setProvider(provider);
    
    conf = new config()
    conf.context(mode)['contract'] = instance._address
    conf.commit();

    console.log("contract deployed at: " + instance._address);
})();
