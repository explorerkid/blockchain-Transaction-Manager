// D:\TRM\backend\server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('./firebaseAdmin'); // Import Firebase admin
const { blockchainSaveTransaction, getBlockchainTransaction } = require('./blockchain'); // Blockchain helper file

// Load environment variables
require('dotenv').config();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// MongoDB schema for transactions
const transactionSchema = new mongoose.Schema({
  amount: Number,
  description: String,
  blockchainId: String,
  userId: String,   // User who created the transaction
  approved: { type: Boolean, default: false },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware for Firebase authentication
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Authorization token is required');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send('Unauthorized');
  }
};

// Add Transaction API
app.post('/transaction', authenticateUser, async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user.uid;

  try {
    // Save to MongoDB for quick access
    const transaction = new Transaction({ amount, description, userId });
    await transaction.save();

    try {
      // Save to Blockchain for immutable record
      const blockchainId = await blockchainSaveTransaction(amount, description);
      if (blockchainId) {
        transaction.blockchainId = blockchainId;  // Link MongoDB record to blockchain
        await transaction.save();
      }
    } catch (blockchainError) {
      console.error('Blockchain error:', blockchainError);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ 
      error: 'Error saving transaction',
      details: error.message 
    });
  }
});

// Get Transactions API (for Admin/Accountant)
app.get('/transactions', authenticateUser, async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
});

// Approve Transaction API (for Admin/Accountant)
app.post('/approve-transaction', authenticateUser, async (req, res) => {
  const { transactionId } = req.body;
  const { user } = req;

  if (user.role !== 'admin') {
    return res.status(403).send('Access forbidden');
  }

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).send('Transaction not found');
    }

    transaction.approved = true;
    await transaction.save();

    res.status(200).send('Transaction approved');
  } catch (error) {
    res.status(500).send('Error approving transaction');
  }
});

// Admin management endpoint
app.post('/set-admin', async (req, res) => {
  try {
    const { uid } = req.body;
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    
    res.status(200).send({ message: 'Successfully set as admin' });
  } catch (error) {
    console.error('Error setting admin role:', error);
    res.status(500).send('Error setting admin role');
  }
});

// Add verification endpoint
app.get('/verify-transactions', authenticateUser, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Access forbidden');
    }

    try {
        // Get MongoDB transactions
        const mongoTransactions = await Transaction.find();
        
        // Get blockchain data for each transaction
        const verifiedTransactions = await Promise.all(
            mongoTransactions.map(async (txn) => {
                if (!txn.blockchainId) return { ...txn.toObject(), verified: false };
                
                const blockchainData = await getBlockchainTransaction(txn.blockchainId);
                const verified = blockchainData && 
                    Number(blockchainData.amount) === txn.amount &&
                    blockchainData.description === txn.description &&
                    blockchainData.approved === txn.approved;
                
                return {
                    ...txn.toObject(),
                    blockchainData,
                    verified
                };
            })
        );
        
        res.json(verifiedTransactions);
    } catch (error) {
        console.error('Error verifying transactions:', error);
        res.status(500).json({ error: 'Error verifying transactions' });
    }
});

// Modified server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        app.listen(PORT + 1);
    } else {
        console.error('Server error:', err);
    }
});
