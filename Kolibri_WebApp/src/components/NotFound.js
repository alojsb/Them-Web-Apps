import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Import the CSS file if needed

const NotFound = () => {
  return (
    <div className='not-found'>
      <h1>404 - Page Not Found</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to='/' className='back-home-link'>
        Back to Home Page
      </Link>
    </div>
  );
};

export default NotFound;
