// node modules
const Web3 = require('web3-eth');
const fs = require('fs-extra');
const NodeRSA = require('node-rsa');
const cli = require('commander');
const homedir = require('os').homedir();

fs.ensureDirSync(homedir+'/.memo')

// remember to start ganache dev server
const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);

// load the contract
const Memo = require("../ethereum/build/Memo.json");
const utils = require("../common/web3utils");


function encrypt(key, msg){
  return new NodeRSA(key).encrypt(msg, 'base64');
}

function decrypt(msg){
  private_key = fs.readFileSync(homedir+'/.memo/private_key_user0', 'utf8')
  return new NodeRSA(private_key).decrypt(msg, 'utf8');
}

async function setup(){
  memo = await utils.get_contract(web3, Memo)
  accounts = await web3.getAccounts();
  source = accounts[0]
  target = accounts[0]
}

async function run_cli () {
  
  cli
  .command('deploy') 
  .description('deploy contract')
  .action(async()=>{
    accounts = await web3.getAccounts();
    memo = await utils.deploy(web3, provider, Memo, accounts[0]);
  });

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
      gas: '1000000' // max gas allowed by ganache server
    });
    console.log('user enrolled successfully')
  });

  cli
  .command('send <msg>') 
  .description('cmd description')
  .action(async(msg)=>{
    await setup();
    rv = await memo.methods.getUserKey(target).call({from: source});
    const buf = Buffer.from(rv.slice(2), 'hex');
    pk_dec = buf.toString('ascii');
    encrypted = encrypt(pk_dec, msg);
    await memo.methods.sendMemo(target, encrypted).send({
      from: source,
      gas: '1000000'
    });
    console.log('message:\n\t' + msg + '\nsent successfully as:\n\t' + encrypted)
  });

  cli
  .command('get <msg_index>') 
  .description('get memo at index')
  .action(async(msg_index)=>{
    await setup();
    rv = await memo.methods.getMemo(parseInt(msg_index)).call({from: target});
    if (rv.content == 'empty cell'){
      console.log('empty cell')
      return
    }
    alias = await memo.methods.getUserAlias(rv.source).call({from: target});
    console.log('message received at index ' + msg_index +':')
    console.log(alias + ': ' + decrypt(rv.content));  });

  cli
  .command('getAll') 
  .description('get all memos in inbox')
  .action(async()=>{
    await setup();
    msgs_count = await memo.methods.getMemoCount(target).call();
    console.log('messages received:')
    for (i = 0; i< msgs_count; i++){
      rv = await memo.methods.getMemo(i).call({from: source});
      alias = await memo.methods.getUserAlias(rv.source).call({from: target});
      console.log(i + ') ' + alias + ": " + decrypt(rv.content));
    }
  });

  cli
  .command('cmd') 
  .description('cmd description')
  .action(async()=>{
    await setup();
    // cmd code 
  });

  await cli.parse(process.argv);
}

run_cli ();