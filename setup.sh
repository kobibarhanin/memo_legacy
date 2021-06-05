#! /bin/bash

# ethereum network [local / rinkeby]
NETWORK=$1

# compile the contract
npm run --silent compile

# clear current installation
rm -rf "$HOME/.memo"

# deploy contract to ethereum network
npm run --silent deploy $NETWORK

# set memo run mode
npm run --silent memo set-global-conf active-mode $NETWORK

# setup a user on the memo contract
npm run --silent memo setup $NETWORK

# send some messages (to self)
echo "--------------------------------------"
npm run --silent memo send user0 "henlo fren" 
echo "--------------------------------------"
npm run --silent memo send user0 "whats up"
echo "--------------------------------------"
npm run --silent memo send user0 "this is awsome"
echo "--------------------------------------"

# test getting messeges 
npm run --silent memo get 0
echo "--------------------------------------"
npm run --silent memo get all
