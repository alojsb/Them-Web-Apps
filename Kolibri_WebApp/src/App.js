import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
