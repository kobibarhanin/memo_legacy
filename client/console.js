// node modules
const Web3 = require('web3-eth');
const fs = require('fs-extra');
const NodeRSA = require('node-rsa');
const cli = require('commander');
const homedir = require('os').homedir();
const {encrypt, decrypt} = require('../common/cryptoutils')

fs.ensureDirSync(homedir+'/.memo')

// remember to start ganache dev server
const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

// load the contract
const Memo = require("../ethereum/build/Memo.json");
const utils = require("../common/web3utils");

async function setup(){
  memo = await utils.get_contract(web3, Memo)
  accounts = await web3.getAccounts();
  source = accounts[0]
  target = accounts[0]
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
      from: alias=='user0' ? source : target,
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

      console.log('index: ' + arg 
                  + '\nfrom: ' + alias 
                  + '\nmessage: ' + '\"' + decrypt(rv.content) + '\"')
    }
  });

  // cli
  // .command('cmd') 
  // .description('cmd description')
  // .action(async()=>{
  //   await setup();
  //   // cmd code 
  // });

  await cli.parse(process.argv);
}

try{
  run_cli ();
} catch(err){
  console.log(err)
}
