const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const provider = ganache.provider();
const web3 = new Web3(provider);

const Memo = require("../ethereum/build/Memo.json");
const utils = require("../common/utils");

let memo;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  memo = await utils.deploy(web3, provider, Memo, accounts[0]);
});

describe("Memo", () => {
  it("deploys a memo contract", () => {
    assert.ok(memo.options.address);
  });

  it("adds a user to memo", async () => {
    await utils.transact(memo.methods.addUser, accounts[0], accounts[0]);
    const users = await memo.methods.getUsers().call();
    assert.ok(users);
  });

  it("send memo", async () => {

    await memo.methods.sendMemo(accounts[1], "hello there!").send({
      from: accounts[0],
      gas: '1000000'
    });

    const rv = await memo.methods.getMemo(0).call({from: accounts[1]});
    assert.ok(rv.source == accounts[0]);
    assert.ok(rv.content == "hello there!");
  });

});
