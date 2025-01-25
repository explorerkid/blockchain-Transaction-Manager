import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase-config';

const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Don't show navigation on login/signup pages
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  // Don't show navigation if not logged in
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => navigate('/transactions')}>
            Transactions
          </Button>
          {user?.role === 'admin' && (
            <Button color="inherit" onClick={() => navigate('/admin')}>
              Admin
            </Button>
          )}
        </Box>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 