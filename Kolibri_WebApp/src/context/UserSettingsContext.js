import React, { useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext'; // To fetch currentUser

const UserSettingsContext = React.createContext();

export const UserSettingsProvider = ({ children }) => {
  const { currentUser } = useAuth(); // Fetch the current authenticated user
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [defaultMaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-male.jpg?alt=media&token=3d4497dc-6863-4510-8e2b-87d5edadedd2'
  );
  const [defaultFemaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-female.jpg?alt=media&token=4d28ada1-68de-4c09-938a-ad0cff296d53'
  );
  const [defaultNeutralProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-neutral.jpg?alt=media&token=8440818c-b0b8-4db1-8852-e4ef8464f20c'
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setLoggedInUserData(userDoc.data()); // Store user data in context
          } else {
            console.error('User document not found');
          }
        } catch (error) {
          console.error('Error fetching user data: ', error.message);
        }
      }
    };

    fetchUserData();
  }, [currentUser]); // Depend on currentUser, which comes from AuthContext

  const updateLoggedInUserData = async (userId) => {
    const userDoc = doc(firestore, 'users', userId);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      setLoggedInUserData(userSnapshot.data()); // Update the user data in the context
    }
  };

  return (
    <UserSettingsContext.Provider
      value={{
        loggedInUserData,
        defaultMaleProfileUrl,
        defaultFemaleProfileUrl,
        defaultNeutralProfileUrl,
        updateLoggedInUserData,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSet = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSet must be used within an UserSettingsProvider');
  }
  return context;
};
