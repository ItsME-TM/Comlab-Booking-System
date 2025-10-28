import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/auth.css';
import axios from 'axios';
import { Button } from '../../components/atoms';
import EntranceImage from '../../assets/images/entrance.jpg';

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
      const response = await axios.post('/api/auth/login', loginData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
    <div>
      <div className='page-container-login'>
        <div className='form-container-login'>
          <h1>Admin Log in</h1>
          <h3>Sign in to continue</h3>
          <form className='form-signin' onSubmit={sendData}>
            <div className='form-group-login'>
              <label htmlFor='email' className='label'>
                Email
              </label>
              <input
                type='email'
                id='email'
                className='input-1'
                placeholder='Enter the email'
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className='form-group-login'>
              <label htmlFor='password' className='label'>
                Password
              </label>
              <input
                type='password'
                id='password'
                className='input-1'
                placeholder='Enter the password'
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className='forgot-password-1'>
              <Link
                to='/forgotpassword'
                style={{ textDecoration: 'underline' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className='buttons'>
              <Button
                text='Log in'
                borderRadius='50px'
                width='125px'
                height='50px'
                marginTop='20px'
                type='submit'
              />
            </div>
          </form>
          {errorMessage && (
            <p className='error-message-login'>{errorMessage}</p>
          )}
        </div>
      </div>

      <div className='image-container-login'>
        <img
          src={EntranceImage}
          alt='university-photograph-entrance'
          className='EntranceUniImage'
        />
      </div>
    </div>
  );
}
