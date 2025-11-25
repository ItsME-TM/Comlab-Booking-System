import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';
import axios from 'axios';
import Buttons from '../components/submitButton';
import EntranceImage from '../images/entrance.jpg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const sendData = async e => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    try {
      console.log('Attempting to log in with:', loginData);
      const response = await axios.post('/api/auth/login', loginData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login response:', response);
      const { role } = response.data.user;
      if (role === 'lecturer' || role === 'Instructor') {
        alert('Redirect to the User login page.');
        navigate('/userSingIn');
      } else if (role === 'admin') {
        const token = response.data.token;
        localStorage.setItem('token', token);
        navigate('/adminhome');
      } else {
        setErrorMessage('Unauthorized role');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Server error');
      }
    }
  };
  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='auth-form-section'>
          <div className='auth-form-wrapper'>
            <div className='auth-header'>
              <h1>Admin Log in</h1>
              <p className='auth-subtitle'>Sign in to continue</p>
            </div>
            
            <form className='auth-form' onSubmit={sendData}>
              <div className='form-group'>
                <label htmlFor='email' className='form-label'>
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  className='form-input'
                  placeholder='Enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className='form-group'>
                <label htmlFor='password' className='form-label'>
                  Password
                </label>
                <input
                  type='password'
                  id='password'
                  className='form-input'
                  placeholder='Enter your password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className='forgot-password-link'>
                <Link to='/forgotpassword'>
                  Forgot password?
                </Link>
              </div>
              
              <div className='form-actions'>
                <Buttons
                  text='Log in'
                  borderRadius='50px'
                  width='125px'
                  height='50px'
                  marginTop='20px'
                />
              </div>
              
              {errorMessage && (
                <div className='error-message' role='alert'>
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
        
        <div className='auth-image-section'>
          <div className='auth-image-overlay'></div>
          <img
            src={EntranceImage}
            alt='University entrance'
            className='auth-background-image'
          />
        </div>
      </div>
    </div>
  );
}
