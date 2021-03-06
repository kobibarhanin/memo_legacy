 #! /bin/bash

# compile the contract
npm run --silent compile

# clear current installation
rm -rf "$HOME/.memo"

# deploy contract to local ethereum network
npm run --silent console deploy

# enroll a user to the contract
npm run --silent console enroll user0

# send some messages
npm run --silent console send "henlo fren"
npm run --silent console send "whats up"
npm run --silent console send "this is awsome"

# test getting messeges 
npm run --silent console get 0
npm run --silent console getAll
