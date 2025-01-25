// src/components/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/transactions`,
          {
            headers: {
              Authorization: token
            }
          }
        );
        setTransactions(response.data.transactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions');
        setLoading(false);
      }
    };

    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const handleApproveTransaction = async (transactionId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/approve-transaction`,
        { transactionId },
        {
          headers: {
            Authorization: token
          }
        }
      );
      // Refresh transactions after approval
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/transactions`,
        {
          headers: {
            Authorization: token
          }
        }
      );
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error approving transaction:', error);
      setError('Failed to approve transaction');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {transactions.length === 0 ? (
        <Typography>No transactions found</Typography>
      ) : (
        <Box>
          {transactions.map((transaction) => (
            <Box key={transaction._id} sx={{ padding: 2, border: '1px solid #ddd', marginBottom: 2 }}>
              <Typography>Amount: {transaction.amount}</Typography>
              <Typography>Description: {transaction.description}</Typography>
              <Typography>Status: {transaction.approved ? 'Approved' : 'Pending'}</Typography>
              {!transaction.approved && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApproveTransaction(transaction._id)}
                  sx={{ mt: 1 }}
                >
                  Approve
                </Button>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
