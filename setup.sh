 #! /bin/bash

# compile the contract
npm run --silent compile

# deploy contract to local ethereum network
npm run --silent console deploy

# enroll a user to the contract
npm run --silent console enroll user0

# send some messages
npm run --silent console sendMsg "henlo fren"
npm run --silent console sendMsg "whats up"
npm run --silent console sendMsg "this is awsome"

# test getting messeges 
npm run --silent console getMsg 0
npm run --silent console getAllMsgs
