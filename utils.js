
async function deploy(web3, provider, contract, user, args=null) {
    instance = await new web3.eth.Contract(JSON.parse(contract.interface))
    .deploy({ data: contract.bytecode, arguments: args })
    .send({ from: user, gas: '1000000' });
    instance.setProvider(provider);
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