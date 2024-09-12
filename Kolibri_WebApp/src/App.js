import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import Navbar from './components/Navbar';
import { UserSettingsProvider } from './context/UserSettingsContext';

const App = () => {
  return (
    <UserSettingsProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </UserSettingsProvider>
  );
};

export default App;
