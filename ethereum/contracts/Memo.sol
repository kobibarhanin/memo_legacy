pragma solidity ^0.4.19;


contract Memo {
    
    struct Message {
        string content;
        address source;
        uint256 timestamp;
    }
    
    struct User {
        string alias;
        bytes pkey;
    }

    address public manager;
    
    mapping(address => User) public users;

    mapping(address => Message[]) public userMemos; // for each user - the memos he is received
    mapping(address => uint256) public userMemosCount; // for each user - the amount of memos he is received

    constructor() public {
        manager = msg.sender;
    }

    function enroll(bytes pkey, string alias) public payable {
        User memory newUser = User({
           alias: alias,
           pkey: pkey
        });
        users[msg.sender] = newUser;
    }

    function getUserKey(address user) public view returns (bytes pkey) {
        return users[user].pkey;
    }

    function sendMemo(address target, string content) public payable {
        Message memory newMessage = Message({
           content: content,
           source: msg.sender,
           timestamp: now
        });
        userMemos[target].push(newMessage);
        userMemosCount[target] +=1;
    }
    
    function getMemo(uint256 idx) public view returns (address source, string content) {
        if (idx >= userMemosCount[msg.sender]){
            return (0, "empty cell");
        }
        return (userMemos[msg.sender][idx].source, userMemos[msg.sender][idx].content);
    }
    
    function getMemoCount(address user) public view returns (uint256 count) {
        return userMemosCount[user];
    }
}