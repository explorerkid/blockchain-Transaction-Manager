const path = require("path");

module.exports = {
  // Network configuration
  networks: {
    development: {
      host: "127.0.0.1", // Ganache local blockchain host
      port: 7545,         // Match Ganache port
      network_id: "5777",    // Match any network id
      gas: 6721975,       // Increased gas limit
      gasPrice: 20000000000 // Gas price for transactions (in wei)
    },
  },

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.8.0",   // Solidity version to compile with
      settings: {
        optimizer: {
          enabled: true,  // Enable optimization
          runs: 200
        }
      }
    },
  },

  // Define where the compiled contract files will be saved
  contracts_build_directory: path.join(__dirname, "build/contracts"),
};
