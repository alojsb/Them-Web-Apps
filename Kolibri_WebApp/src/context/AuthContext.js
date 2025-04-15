import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../firebase/firebaseConfig'; // Ensure path is correct
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role || 'user'); // Set role from Firestore
        } else {
          setUserRole('user'); // Default to 'user' role if no doc
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getDisplayName = () => {
    if (currentUser) {
      return currentUser.displayName || currentUser.email;
    }
    return 'Guest';
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, getDisplayName }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
