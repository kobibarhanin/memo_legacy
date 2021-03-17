const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const NodeRSA = require('node-rsa');

const provider = ganache.provider();
const web3 = new Web3(provider);
const Memo = require("../ethereum/build/Memo.json");

let memo;
let accounts;

async function deploy(web3, provider, contract, user) {
  instance = await new web3.eth.Contract(JSON.parse(contract.interface))
  .deploy({ data: contract.bytecode })
  .send({ from: user, gas: '1000000' });
  instance.setProvider(provider);
  return instance;
}

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  memo = await deploy(web3, provider, Memo, accounts[0]);
});

describe("Memo", () => {
  it("deploys a memo contract", () => {
    assert.ok(memo.options.address);
  });

  it("adds a user to memo", async () => {
    
    alias = 'user0';
    const key = new NodeRSA({b: 512});
    pub_key_raw = key.exportKey('public');
    // prv_key_raw = key.exportKey('private');
    
    const buf = Buffer.from(pub_key_raw, 'ascii');
    pub_key_enc = '0x' + buf.toString('hex');
    await memo.methods.enroll(pub_key_enc, alias).send({
      from: accounts[0],
      gas: '1000000'
    });

    const ualias = await memo.methods.getUserAlias(accounts[0]).call();
    assert.ok(ualias == alias);
  });

  it("fails to add another user with same alias", async () => {
    
    alias = 'user0';
    const key = new NodeRSA({b: 512});
    pub_key_raw = key.exportKey('public');
    
    const buf = Buffer.from(pub_key_raw, 'ascii');
    pub_key_enc = '0x' + buf.toString('hex');
    rv = await memo.methods.enroll(pub_key_enc, alias).send({
      from: accounts[0],
      gas: '1000000'
    });

    const re_enroll = async () => await memo.methods.enroll(pub_key_enc, alias).send({
      from: accounts[0],
      gas: '1000000'
    });
    
    await assert.rejects(re_enroll)

  });

  it("send memo without encryption", async () => {

    await memo.methods.sendMemo(accounts[0], "hello there!").send({
      from: accounts[0],
      gas: '1000000'
    });

    const rv = await memo.methods.getMemo(0).call({from: accounts[0]});
  
    assert.ok(rv.source == accounts[0]);
    assert.ok(rv.content == "hello there!");
  });

});
