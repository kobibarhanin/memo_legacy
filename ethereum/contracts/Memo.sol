pragma solidity ^0.4.19;


contract Memo {
    
    struct Message {
        string content;
        address source;
        uint256 timestamp;
    }
    
    address public manager;
    address[] public users;
    
    mapping(address => Message[]) public userMemos; // for each user - the memos he is received

    constructor() public {
        manager = msg.sender;
    }

    function addUser(address user) public payable {
        users.push(user);
    }

    function getUsers() public view returns (address[]) {
        return users;
    }

    function sendMemo(address target, string content) public payable {
        Message memory newMessage = Message({
           content: content,
           source: msg.sender,
           timestamp: now
        });
        userMemos[target].push(newMessage);
    }
    
    function getMemo(uint256 idx) public view returns (address source, string content) {
        return (userMemos[msg.sender][idx].source, userMemos[msg.sender][idx].content);
    }
    
}