// src/components/TransactionPage.js
import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TransactionPage = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/transaction`,
        {
          amount: Number(amount),
          description,
        },
        {
          headers: {
            Authorization: token
          }
        }
      );
      setMessage('Transaction successfully added!');
      console.log('Transaction created:', result.data);
      setAmount('');
      setDescription('');
    } catch (error) {
      setMessage('Error adding transaction');
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: 600,
      margin: 'auto',
      marginTop: 4,
      padding: 3,
    }}>
      <Typography variant="h4" gutterBottom>Add Transaction</Typography>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <TextField
          label="Amount"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          required
          multiline
          rows={3}
        />
        <Button 
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Add Transaction
        </Button>
      </form>
      {message && (
        <Typography 
          color={message.includes('Error') ? 'error' : 'success'} 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default TransactionPage;
