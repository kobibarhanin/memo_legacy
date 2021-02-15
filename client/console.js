const Web3 = require("web3");
const { setIntervalAsync } = require('set-interval-async/dynamic')


// remember to start ganache dev server
const provider = new Web3.providers.HttpProvider('http://localhost:7545');
const web3 = new Web3(provider);


// const Telechain = require("./build/Telechain.json");
const Session = require("../ethereum/build/Session.json");
const utils = require("../utils");
const readline = require("readline");


let accounts;
let session;


// parse the activating account from args 
// account = index for local address usage, e.g - 0,1,.. in the ganache server
var account = parseInt(process.argv.slice(2)[0]);


// create input object
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});


async function deploy_session(){
    accounts = await web3.eth.getAccounts();
    session = await utils.deploy(web3, provider, Session, accounts[0], [[accounts[0],accounts[1]]]);    
}


async function getInput() {
    rl.question(">> ", async function(message) {
        if (message == "exit"){
            rl.close();
        } else {
            await utils.transact(
                session.methods.sendMessage,
                accounts[account],
                message
              );
            getInput();
        }
    });
}

// set the listener to new session messages

setIntervalAsync(async () => {
    message = await session.methods.getMessage().call({
        from: accounts[account],
    });
    console.log('from session: ' + message.content);
    
    // This should be solved on the client side with a call and not a transaction
    await utils.transact(
        session.methods.updateCounter,
        accounts[account]
      );
    },
    5000
)

deploy_session();
getInput();



