// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Transaction {
    struct TransactionData {
        uint id;
        address client;
        uint amount;
        string description;
        bool approved;
    }
    
    mapping(uint => TransactionData) public transactions;
    uint public transactionCount;

    // Add new transactions to the blockchain
    function addTransaction(address _client, uint _amount, string memory _description) public {
        transactionCount++;
        transactions[transactionCount] = TransactionData(
            transactionCount, 
            _client, 
            _amount, 
            _description, 
            false
        );
    }

    // Get a single transaction by ID
    function getTransaction(uint _id) public view returns (
        uint id,
        address client,
        uint amount,
        string memory description,
        bool approved
    ) {
        require(_id > 0 && _id <= transactionCount, "Transaction does not exist");
        TransactionData memory txn = transactions[_id];
        return (txn.id, txn.client, txn.amount, txn.description, txn.approved);
    }

    // Get all transactions
    function getAllTransactions() public view returns (TransactionData[] memory) {
        TransactionData[] memory allTxns = new TransactionData[](transactionCount);
        for(uint i = 1; i <= transactionCount; i++) {
            allTxns[i-1] = transactions[i];
        }
        return allTxns;
    }

    // Approve transactions on the blockchain
    function approveTransaction(uint _id) public {
        require(_id > 0 && _id <= transactionCount, "Transaction does not exist");
        require(!transactions[_id].approved, "Transaction already approved");
        transactions[_id].approved = true;
    }
}