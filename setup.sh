 #! /bin/bash

# compile the contract
npm run --silent compile

# clear current installation
rm -rf "$HOME/.memo"

# deploy contract to local ethereum network
npm run --silent deploy

# enroll a user to the contract
npm run --silent memo enroll user0

# send some messages
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
