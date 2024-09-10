import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import './Navbar.css';

const Navbar = () => {
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth(); // Access user and role from AuthContext

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Handle empty firstName or lastName
            const nameToDisplay =
              (userData.firstName && userData.firstName.trim()) ||
              (userData.lastName && userData.lastName.trim()) ||
              currentUser.email;
            setDisplayName(nameToDisplay);
          } else {
            // If no user data is found, fallback to the email
            setDisplayName(currentUser.email);
          }
        } catch (error) {
          console.error('Error fetching user data: ', error.message);
          setDisplayName(currentUser.email); // Fallback to email if error occurs
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>
        <h1>Library</h1>
      </div>
      <ul className='navbar-links'>
        {currentUser ? (
          <>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/books'>Books</Link>
            </li>
            <li>
              <Link to='/reservations'>Reservations</Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link to='/inventory'>Inventory</Link>
              </li>
            )}
            {userRole === 'admin' && (
              <li>
                <Link to='/rental'>Rental</Link>
              </li>
            )}
            <li>
              <Link to={`/users/${currentUser.uid}`}>Profile</Link>
            </li>
            <li className='navbar-user'>
              {displayName} (Role: {userRole})
            </li>
            <li>
              <button className='navbar-logout' onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to='/login'>Login</Link>
            </li>
            <li>
              <Link to='/register'>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
