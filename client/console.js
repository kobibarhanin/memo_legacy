// node modules
const Web3 = require('web3-eth');
const fs = require('fs-extra');
const NodeRSA = require('node-rsa');
const cli = require('commander');
const inquirer = require('inquirer');
const HDWalletProvider = require('truffle-hdwallet-provider')
const homedir = require('os').homedir();

const { encrypt, decrypt } = require('../common/crypto')
const { config } = require('../common/config')
const { env } = require('../client/envs')


conf = new config()

// load the contract
const Memo = require("../ethereum/build/Memo.json");
const utils = require("../common/web3");

async function setup(){

  if (conf.global()['active-mode'] == 'local'){
    provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  else {
    provider = new HDWalletProvider(conf.context()['user']['mnemonic'], conf.context()['provider']['gw'], 0, 2);
  }

  web3 = new Web3(provider);
  memo = await utils.get_contract(web3, Memo)
  accounts = await web3.getAccounts();
  source = conf.context()['user']['address']
}

async function run_cli () {
  
  cli
  .command('enroll <alias>') 
  .description('enroll user to contract')
  .action(async(alias)=>{
    await setup();

    // add logic for existing key insertion
    const key = new NodeRSA({b: 512});
    pk_raw = key.exportKey('public');
    fs.writeFileSync(homedir + '/.memo/private_key_' + alias, 
                     key.exportKey('private'));
    
    const buf = Buffer.from(pk_raw, 'ascii');
    pk_enc = '0x' + buf.toString('hex');
    await memo.methods.enroll(pk_enc, alias).send({
      from: source,
      gas: '1000000'
    });
    console.log('user enrolled successfully')
  });

  cli
  .command('send <alias> <msg>')
  .description('cmd description')
  .action(async(alias, msg)=>{
    await setup();
    address = await memo.methods.getUserAddress(alias).call();
    rv = await memo.methods.getUserKey(address).call({from: source});
    const buf = Buffer.from(rv.slice(2), 'hex');
    pk_dec = buf.toString('ascii');
    encrypted = encrypt(pk_dec, msg);
    await memo.methods.sendMemo(address, encrypted).send({
      from: source,
      gas: '1000000'
    });
    console.log('message: \"' + msg +'\"'
                + '\nsent to: ' + alias
                + '\nin address: ' + address
                + '\nencrypted: '+ encrypted)
  });

  cli
  .command('get')
  .arguments('<arg>')
  .description('get memo at index')
  .action(async(arg)=>{
    await setup();
    
    if (arg == 'all'){
      msgs_count = await memo.methods.getMemoCount(source).call();
      console.log('messages received:')
      for (i = 0; i< msgs_count; i++){
        rv = await memo.methods.getMemo(i).call({from: source});
        alias = await memo.methods.getUserAlias(rv.source).call({from: source});
        console.log('index: ' + i 
                    + '\nfrom: ' + alias 
                    + '\nmessage: ' + '\"' + decrypt(rv.content) + '\"'
                    + '\n--------------------------------------')
      }  
    } else {
      rv = await memo.methods.getMemo(parseInt(arg)).call({from: source});
      if (rv.content == 'empty cell'){
        console.log('empty cell')
        return
      }
      alias = await memo.methods.getUserAlias(rv.source).call({from: source});
      console.log(rv.content)
      console.log('index: ' + arg 
                  + '\nfrom: ' + alias 
                  + '\nmessage: ' + '\"' + decrypt(rv.content) + '\"')
    }
  });

  cli
  .command('setup')
  .arguments('[arg]')
  .description('cmd description')
  .action(async(arg)=>{

    if (arg != null){
      defaults = env(arg)

      alias = defaults.alias;
      wallet_address = defaults.wallet_address;
      mode = defaults.mode;
      mnemonic = defaults.mnemonic;
    }
    else{
      defaults = env('local');
      answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'mode',
            message: 'select mode to setup:',
            choices: ['local', 'rinkeby'],
            default: defaults.mode,
        },
        {
            name: 'alias',
            message: 'choose your alias:',
            default: defaults.alias,
        },
        {
            name: 'wallet_address',
            message: 'provide your wallet address:',
            default: defaults.wallet_address,
        },
        {
          name: 'mnemonic',
          message: 'insert your mnemonic:',
          default: defaults.mnemonic,
      },
      ]);
    
      alias = answers.alias;
      wallet_address = answers.wallet_address;
      mode = answers.mode;
      mnemonic = answers.mnemonic;
    }

    const key = new NodeRSA({b: 512});
    pub_key_raw = key.exportKey('public');
    prv_key_raw = key.exportKey('private');

    conf.context(mode)['user'] =  {
      "alias": alias,
      "address": wallet_address,
      "mnemonic": mnemonic,
      "pub_key": pub_key_raw,
      "prv_key": prv_key_raw
    }

    await setup();
    conf.commit();

    const buf = Buffer.from(pub_key_raw, 'ascii');
    pk_enc = '0x' + buf.toString('hex');
    await memo.methods.enroll(pk_enc, alias).send({
      from: source,
      gas: '1000000'
    });
    console.log('user enrolled successfully')
  });

  cli
  .command('set-global-conf')
  .arguments('[key] [val]') 
  .description('cmd description ...')
  .action(async(key, val)=>{
    conf.global()[key] = val;
    conf.commit();
    console.log('done');
  });

  cli
  .command('set-user-conf')
  .arguments('[key] [val]') 
  .description('cmd description ...')
  .action(async(key, val)=>{
    conf.context()['user'][key] = val;
    conf.commit();
    console.log('done');
  });

  await cli.parse(process.argv);
}

try{
  run_cli ();
} catch(err){
  console.log(err)
}
