import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { auth } from '../firebase/firebaseConfig'; // Import auth

const Navbar = () => {
  const { currentUser, getDisplayName, userRole } = useAuth(); // Use userRole

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {currentUser ? (
          <>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <span>Welcome, {getDisplayName()}</span> {/* Display user name or email */}
            </li>
            <li>
              <span>Role: {userRole}</span> {/* Display user role */}
            </li>
            <li>
              <button onClick={() => auth.signOut()}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
