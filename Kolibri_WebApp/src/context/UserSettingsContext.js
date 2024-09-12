import React, { useContext, useState } from 'react';

const UserSettingsContext = React.createContext();

export const UserSettingsProvider = ({ children }) => {
  const [defaultMaleProfileUrl, setDefaultMaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-male.jpg?alt=media&token=3d4497dc-6863-4510-8e2b-87d5edadedd2'
  );
  const [defaultFemaleProfileUrl, SetDefaultFemaleProfileUrl] = useState(
    'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-female.jpg?alt=media&token=4d28ada1-68de-4c09-938a-ad0cff296d53'
  );

  return (
    <UserSettingsContext.Provider
      value={{
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
