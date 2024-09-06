import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../firebase/firebaseConfig'; // Ensure path is correct
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Default role

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);

      if (user) {
        const userDoc = doc(firestore, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserRole(userData.role || 'user'); // Default to 'user' if role is not found
        }
      } else {
        setUserRole('user'); // Default role if no user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const getDisplayName = () => {
    if (currentUser) {
      return currentUser.displayName || currentUser.email;
    }
    return 'Guest';
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, getDisplayName }}>
      {children}
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
