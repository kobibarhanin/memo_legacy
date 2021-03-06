const fs = require('fs-extra');
const homedir = require('os').homedir();

// this is for dev purposes 
async function deploy(web3, provider, contract, user, args=null) {
    instance = await new web3.Contract(JSON.parse(contract.interface))
    .deploy({ data: contract.bytecode, arguments: args })
    .send({ from: user, gas: '1000000' });
    instance.setProvider(provider);
    console.log("contract deployed at: " + instance._address);
    fs.writeFileSync(homedir + "/.memo/contract_address", instance._address);
    return instance;
}

async function get_contract(web3, contract, address=null) {
    // this is for dev purposes 
    if (!address){
        address = fs.readFileSync(homedir + "/.memo/contract_address", 'utf8');
    }
    instance = await new web3.Contract(JSON.parse(contract.interface))
    instance.options.address = address
    return instance;
}

async function transact(method, user, args=null) {
    if (args == null){
        return await method().send({
            from: user,
            gas: '1000000'
          });
    }
    else {
        return await method(args).send({
            from: user,
            gas: '1000000'
          });
    }

}

exports.deploy = deploy;
exports.transact = transact;
exports.get_contract = get_contract;
