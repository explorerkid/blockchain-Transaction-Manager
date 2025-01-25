// src/components/SignUp.js
import React, { useState } from 'react';
import { auth } from '../firebase-config';
import { TextField, Button, Box, Typography } from '@mui/material';

const SignUp = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Error creating account');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Sign Up</Typography>
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button onClick={handleSignUp} variant="contained">Sign Up</Button>
    </Box>
  );
};

export default SignUp;
