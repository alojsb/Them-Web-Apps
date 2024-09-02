import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import '../../App.css';
import './header.css';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  return (
    <nav className='nav-bar'>
      {userLoggedIn ? (
        <>
          <button
            onClick={() => {
              doSignOut().then(() => {
                navigate('/login');
              });
            }}
            className='nav-bar-link'
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link className='nav-bar-link' to={'/login'}>
            Login
          </Link>
          <Link className='nav-bar-link' to={'/register'}>
            Register New Account
          </Link>
        </>
      )}
    </nav>
  );
};

export default Header;
