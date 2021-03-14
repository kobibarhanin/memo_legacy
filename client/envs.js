module.exports = {
    env: (name) => {
        if (name == 'local'){
            return {
                alias: 'user0',
                wallet_address: '0xfA941ccCE4330B0aDF680bb4F8523c5a826939d3',
                mode: 'local',
                mnemonic: null
            }
        } else if (name == 'rinkeby'){
            return {
                alias: 'user0',
                wallet_address: '0xd6dc673a62Ae356CCd4ea4C9570BD0476F866D40',
                mode: 'rinkeby',
                mnemonic: 'ten jewel message joke radio cushion few worry tiny shock hidden two'
            }
        }
    }
}