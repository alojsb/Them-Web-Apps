import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import AppRoutes from './routes';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import './assets/styles.css';

const App = () => (
  <AuthProvider>
    <Router> {/* Wrap the entire application in BrowserRouter */}
      <div className="App">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  </AuthProvider>
);

export default App;
