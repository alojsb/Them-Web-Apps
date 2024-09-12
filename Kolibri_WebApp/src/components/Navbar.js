import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import './Navbar.css';
import placeholder from '../assets/placeholder-profile.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [displayName, setDisplayName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const nameToDisplay =
              userData.firstName || userData.lastName || currentUser.email;
            setDisplayName(nameToDisplay);

            setProfilePictureUrl(userData.profilePictureUrl || placeholder);
          } else {
            setDisplayName(currentUser.email);
            setProfilePictureUrl(placeholder);
          }
        } catch (error) {
          console.error('Error fetching user data: ', error.message);
          setDisplayName(currentUser.email);
          setProfilePictureUrl(placeholder);
        }
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false); // Close the context menu after logging out
      navigate('/login');
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuClick = (path) => {
    setShowMenu(false); // Close the context menu when navigating
    navigate(path); // Navigate to the selected path
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
