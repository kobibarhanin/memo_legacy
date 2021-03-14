const { config } = require('../common/config')

module.exports = {
    get_contract: async (web3, contract) => {
        address = new config().context()['contract']
        instance = await new web3.Contract(JSON.parse(contract.interface))
        instance.options.address = address
        return instance;
    }
}
