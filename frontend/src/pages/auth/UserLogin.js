import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Buttons from '../../components/submitButton';
import EntranceImage from '../../images/entrance.jpg';
import '../../styles/auth.css';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
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

      if (role === 'admin') {
        alert('Redirect to the Admin login page.');
        navigate('/adminlogin');
      } else if (role === 'lecturer' || role === 'instructor') {
        const token = response.data.token;
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else if (role === 'to') {
        const token = response.data.token;
        localStorage.setItem('token', token);
        navigate('/toHome');
      } else {
        setErrorMessage('Unauthorized role');
      }
      setFailedAttempts(0);
    } catch (error) {
      console.error('Login error:', error);
      setFailedAttempts(prev => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          navigate('/errmsg');
        }
        return newAttempts;
      });
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
              <h1>Log in</h1>
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
