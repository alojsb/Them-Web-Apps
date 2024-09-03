import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth';

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { userLoggedIn } = useAuth();

  const errorMessageHandler = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isRegistering) {
      if (password !== confirmPassword) {
        errorMessageHandler('Password entries do not match');
      } else {
        setIsRegistering(true);
        await doCreateUserWithEmailAndPassword(email, password).catch((err) => {
          setIsRegistering(false);
          errorMessageHandler(err.message);
        });
      }
    }
  };

  return (
    <>
      {userLoggedIn && <Navigate to={'/home'} replace={true} />}

      <main className='main'>
        <div className='frame'>
          <div className='title_container'>
            <div className='title_div'>
              <h3 className='title'>Create a New Account</h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className='login_form'>
            <div>
              <label className='login_form_label'>Email</label>
              <input
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className='login_form_input'
              />
            </div>

            <div>
              <label className='login_form_label'>Password</label>
              <input
                disabled={isRegistering}
                type='password'
                autoComplete='new-password'
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className='login_form_input'
              />
            </div>

            <div>
              <label className='login_form_label'>Confirm Password</label>
              <input
                disabled={isRegistering}
                type='password'
                autoComplete='off'
                required
                value={confirmPassword}
                onChange={(e) => {
                  setconfirmPassword(e.target.value);
                }}
                className='login_form_input'
              />
            </div>

            {errorMessage && (
              <div className='error_message'>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type='submit'
              disabled={isRegistering}
              className={`submit_btn button ${
                isRegistering ? 'signing_in_true' : 'signing_in_false'
              }`}
            >
              {isRegistering ? 'Signing Up...' : 'Sign Up'}
            </button>
            <p className='register_paragraph'>
              Already have an account? {'   '}
              <Link to={'/login'} className='register_link'>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
};

export default Register;
