// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token with fresh claims
        const idToken = await firebaseUser.getIdToken(true);
        const tokenResult = await firebaseUser.getIdTokenResult();
        setUser({
          ...firebaseUser,
          role: tokenResult.claims.role || 'user'
        });
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
};
