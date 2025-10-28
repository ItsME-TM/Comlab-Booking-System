import React, { useState } from 'react';
import NavBarBL from '../components/navBarBL';
import '../components/signIn.css';
import { Link } from 'react-router-dom';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const handleSubmit = async event => {
    event.preventDefault();

    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
    };

    if (formData.email !== mockUserData.email) {
      setErrorMessage('User not found');
      return;
    }
    if (formData.password === mockUserData.password) {
      /// change after adding position base front end using email first 3 digit
      window.location.href = '/Dashboard';
    } else {
      setErrorMessage('Incorrect password');
      setClickCount(prevCount => prevCount + 1);
      if (clickCount >= 2) {
        window.location.href = '/errmsg';
      }
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleButtonClick = () => {
    setClickCount(prevCount => prevCount + 1);

    if (clickCount >= 2) {
      window.location.href = '/errmsg';
    }
  };

  return (
    <div>
      <NavBarBL />
      <div className='page-container-login'>
        <div className='form-container-login'>
          <h1>Log in</h1>
          <h3>Sign in to continue</h3>

          <form onSubmit={handleSubmit} className='form'>
            <div className='form-group-login'>
              <label htmlFor='email' className='label'>
                Email:
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='input'
              />
              <label htmlFor='password' className='label'>
                Password:
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                className='input'
              />
              <div className='forgot-password'>
                <Link to='/forgotpassword'>Forgot password?</Link>
              </div>
            </div>
            <div className='buttonStyle'>
              <button type='submit' onClick={handleButtonClick}>
                Sign In
              </button>
            </div>
            <div className='Not-registered'>
              <div className='registration-info'>
                <h3>Not Registered?</h3>
                <Link to='/signup'>Create an account!</Link>
              </div>
            </div>
          </form>

          {errorMessage && (
            <p className='error-message-login'>{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
