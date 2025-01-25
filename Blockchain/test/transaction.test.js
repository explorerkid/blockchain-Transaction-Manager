const Transaction = artifacts.require("Transaction");

contract("Transaction", accounts => {
    let transaction;

    // This function runs before each test
    beforeEach(async () => {
        transaction = await Transaction.new();  // Deploy the contract before each test
    });

    it("should add a transaction", async () => {
        // Adding a transaction (client, amount, description)
        await transaction.addTransaction(accounts[1], 1000, "Payment for services");

        // Fetch the transaction data from the blockchain
        const txn = await transaction.transactions(1);

        // Check if the amount is correctly set
        assert.equal(txn.amount.toString(), "1000", "Transaction amount is incorrect");
    });

    it("should approve a transaction", async () => {
        // Adding a transaction
        await transaction.addTransaction(accounts[1], 1000, "Payment for services");

        // Approve the transaction with ID 1
        await transaction.approveTransaction(1);

        // Fetch the transaction after approval
        const txn = await transaction.transactions(1);

        // Check if the transaction is approved
        assert.equal(txn.approved, true, "Transaction was not approved correctly");
    });

    it("should not approve a non-existent transaction", async () => {
        try {
            // Try to approve a transaction that doesn't exist
            await transaction.approveTransaction(999);
            assert.fail("The transaction should not exist");
        } catch (error) {
            // Check for the correct error
            assert(error.message.includes("revert"), "Error should contain 'revert'");
        }
    });
});
