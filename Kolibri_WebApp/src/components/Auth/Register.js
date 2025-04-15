import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../../firebase/firebaseConfig'; // Import Firestore
import { doc, setDoc } from 'firebase/firestore';
import './Register.css'; // Import the CSS file for styling

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Add user to Firestore with default role 'user'
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        role: 'user', // Default role
      });
      navigate('/'); // Redirect to home or another page on successful registration
    } catch (error) {
      setError(error.message); // Set error message from Firebase Authentication
    }
  };

  return (
    <div className='register-container'>
      <h2 className='register-title'>Register</h2>
      <form onSubmit={handleSubmit} className='register-form'>
        <div className='register-form-group'>
          <label htmlFor='email' className='register-label'>
            Email:
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='register-input'
            required
          />
        </div>
        <div className='register-form-group'>
          <label htmlFor='password' className='register-label'>
            Password:
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='register-input'
            required
          />
        </div>
        <div className='register-form-group'>
          <label htmlFor='confirm-password' className='register-label'>
            Confirm Password:
          </label>
          <input
            id='confirm-password'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className='register-input'
            required
          />
        </div>
        {error && <p className='register-error'>{error}</p>}
        <button type='submit' className='register-button'>
          Register
        </button>
      </form>
      <p className='register-login-link'>
        Already have an account? <Link to='/login'>Login</Link>
      </p>
    </div>
  );
};

export default Register;
