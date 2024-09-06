import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import './Navbar.css'; // Import the CSS file for styling

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Library</h1>
      </div>
      <ul className="navbar-links">
        {user ? (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/books">Books</Link></li>
            <li><Link to="/reservations">Reservations</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li className="navbar-user">
              {user.name || user.email} (Role: {user.role})
            </li>
            <li><button className="navbar-logout" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
