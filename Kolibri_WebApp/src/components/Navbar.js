import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { useUserSet } from '../context/UserSettingsContext';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const { loggedInUserData, defaultNeutralProfileUrl } = useUserSet();

  const displayName =
    (loggedInUserData &&
      (loggedInUserData.firstName || loggedInUserData.lastName)) ||
    (currentUser && currentUser.email);

  const profilePictureUrl =
    (loggedInUserData && loggedInUserData.profilePictureUrl) ||
    defaultNeutralProfileUrl;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (path) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>
        <Link to='/' className='navbar-brand-link'>
          <div className='navbar-brand'>
            <FontAwesomeIcon icon={faBookOpen} className='navbar-brand-icon' />
            <span className='navbar-brand-name'>Kolibri</span>
          </div>
        </Link>
      </div>
      <ul className='navbar-links'>
        {currentUser ? (
          <>
            <li>
              <Link to='/books'>Books</Link>
            </li>
            <li>
              <Link to='/users'>Users</Link>
            </li>
            <li>
              <Link to='/reservations'>Reservations</Link>
            </li>
            {userRole === 'admin' && (
              <>
                <li>
                  <Link to='/inventory'>Inventory</Link>
                </li>
                <li>
                  <Link to='/rental'>Rental</Link>
                </li>
              </>
            )}
            {/* Profile Name/Email */}
            <li className='navbar-user'>
              <Link to={`/users/${currentUser.uid}`}>{displayName}</Link>
            </li>

            {/* Profile Picture */}
            <li className='navbar-profile'>
              <img
                src={profilePictureUrl}
                alt='Profile'
                className='profile-picture-navbar'
                onClick={toggleMenu}
              />
              {showMenu && (
                <ul className='profile-menu'>
                  <li>
                    <button
                      onClick={() =>
                        handleMenuClick(`/users/${currentUser.uid}`)
                      }
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button className='navbar-logout' onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
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
