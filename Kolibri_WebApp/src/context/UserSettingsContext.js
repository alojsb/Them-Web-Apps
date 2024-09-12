import React, { useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext'; // To fetch currentUser

const UserSettingsContext = React.createContext();

export const UserSettingsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [defaultMaleProfileUrl, setDefaultMaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-male.jpg?alt=media&token=3d4497dc-6863-4510-8e2b-87d5edadedd2'
  );
  const [defaultFemaleProfileUrl, SetDefaultFemaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-female.jpg?alt=media&token=4d28ada1-68de-4c09-938a-ad0cff296d53'
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data()); // Store user data in context
          }
        } catch (error) {
          console.error('Error fetching user data: ', error.message);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <UserSettingsContext.Provider
      value={{
        userData,
        defaultMaleProfileUrl,
        defaultFemaleProfileUrl,
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
