import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

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
  }, [user, navigate, token]);

  const handleApprove = async (transactionId) => {
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
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell>{transaction._id}</TableCell>
              <TableCell>{transaction.amount}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.userId}</TableCell>
              <TableCell>{transaction.approved ? 'Approved' : 'Pending'}</TableCell>
              <TableCell>
                {!transaction.approved && (
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleApprove(transaction._id)}
                  >
                    Approve
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default AdminDashboard; 