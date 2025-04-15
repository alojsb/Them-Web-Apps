import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import Navbar from './components/Navbar';
import { UserSettingsProvider } from './context/UserSettingsContext';

const App = () => {
  return (
    <AuthProvider>
      <UserSettingsProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </UserSettingsProvider>
    </AuthProvider>
  );
};

export default App;
