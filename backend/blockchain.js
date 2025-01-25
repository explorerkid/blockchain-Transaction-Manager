// D:\TRM\backend\blockchain.js
const { Web3 } = require('web3');
const path = require('path');
const Transaction = require(path.join(__dirname, '../Blockchain/build/contracts/Transaction.json'));

// Connect to local blockchain (Ganache)
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545')); // Match Ganache port

async function blockchainSaveTransaction(amount, description) {
    try {
        // Get network details
        const networkId = await web3.eth.net.getId();
        console.log('Current network ID:', networkId);
        
        const deployedNetwork = Transaction.networks[networkId];
        console.log('Deployed network:', deployedNetwork);
        
        if (!deployedNetwork) {
            throw new Error('Contract not deployed to detected network');
        }

        const contract = new web3.eth.Contract(
            Transaction.abi,
            deployedNetwork.address
        );

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log('Available accounts:', accounts);

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found in the blockchain');
        }

        // Add transaction to blockchain - this creates an immutable record
        const result = await contract.methods
            .addTransaction(accounts[0], amount, description)
            .send({ 
                from: accounts[0],
                gas: 6721975,  // Increased to match Ganache's block gas limit
                gasPrice: '20000000000'  // 20 Gwei
            });

        return result.transactionHash;  // Return blockchain transaction ID
    } catch (error) {
        console.error('Blockchain error:', error);
        // Log more details about the error
        console.error('Error details:', {
            networkId: await web3.eth.net.getId(),
            networks: Object.keys(Transaction.networks),
            contractAddress: Transaction.networks[5777]?.address
        });
        return null;
    }
}

async function getBlockchainTransaction(blockchainId) {
    try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Transaction.networks[networkId];
        
        if (!deployedNetwork) {
            throw new Error('Contract not deployed to detected network');
        }

        const contract = new web3.eth.Contract(
            Transaction.abi,
            deployedNetwork.address
        );

        const txn = await contract.methods.getTransaction(blockchainId).call();
        return {
            id: txn.id,
            client: txn.client,
            amount: txn.amount,
            description: txn.description,
            approved: txn.approved
        };
    } catch (error) {
        console.error('Error fetching blockchain transaction:', error);
        return null;
    }
}

async function getAllBlockchainTransactions() {
    try {
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Transaction.networks[networkId];
        
        if (!deployedNetwork) {
            throw new Error('Contract not deployed to detected network');
        }

        const contract = new web3.eth.Contract(
            Transaction.abi,
            deployedNetwork.address
        );

        const txns = await contract.methods.getAllTransactions().call();
        return txns.map(txn => ({
            id: txn.id,
            client: txn.client,
            amount: txn.amount,
            description: txn.description,
            approved: txn.approved
        }));
    } catch (error) {
        console.error('Error fetching blockchain transactions:', error);
        return [];
    }
}

module.exports = {
    blockchainSaveTransaction,
    getBlockchainTransaction,
    getAllBlockchainTransactions
};
