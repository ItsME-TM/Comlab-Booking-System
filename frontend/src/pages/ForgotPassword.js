import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import axios from 'axios';
import Buttons from '../components/submitButton';
import FacultyImage from '../images/faculty.jpg';
import BeatLoader from 'react-spinners/BeatLoader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [inOtp, setInOpt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendData = async e => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    try {
      let response;

      if (password === confirmPassword && otp === inOtp) {
        response = await axios.post('/api/users/update-password', userData);

        alert('Password updated successfully!');
        console.log('Update password response:', response.data);
        navigate('/userLogin');
      } else {
        // Handle error scenario where password or OTP does not match
        if (password !== confirmPassword) {
          alert('Password and confirmation password do not match.');
        }
        if (otp !== inOtp) {
          alert('OTP does not match.');
        }
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password');
    }
  };

  const getCode = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await axios.get(
        `/api/users/verify-email?email=${email}`,
      );

      setOtp(response.data.otp);

      if (response.data.message === 'Email found') {
        setIsCodeSent(true);
        setErrorMessage('');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <div className='auth-image-section'>
          <div className='auth-image-overlay'></div>
          <img
            src={FacultyImage}
            alt='University faculty building'
            className='auth-background-image'
          />
        </div>

        <div className='auth-form-section'>
          <div className='auth-form-wrapper'>
            <div className='auth-header'>
              <h1>Change Password</h1>
              <p className='auth-subtitle'>Enter your email to receive a verification code</p>
            </div>
            
            <form className='auth-form' onSubmit={sendData}>
              <div className='form-group'>
                <label htmlFor='email' className='form-label'>
                  Email Address
                </label>
                <div className='input-button-wrapper'>
                  <input
                    type='email'
                    id='email'
                    className='form-input input-with-button'
                    placeholder='Enter your email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type='button'
                    onClick={getCode}
                    className='get-code-button'
                    disabled={loading}
                  >
                    {loading ? (
                      <BeatLoader color={'#ffffff'} loading={true} size={8} />
                    ) : (
                      'Get Code'
                    )}
                  </button>
                </div>
              </div>

              {isCodeSent && (
                <>
                  <div className='form-group'>
                    <label htmlFor='password' className='form-label'>
                      New Password
                    </label>
                    <input
                      type='password'
                      id='password'
                      className='form-input'
                      placeholder='Enter new password'
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='confirmPassword' className='form-label'>
                      Confirm Password
                    </label>
                    <input
                      type='password'
                      id='confirmPassword'
                      className='form-input'
                      placeholder='Confirm new password'
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='otp' className='form-label'>
                      Verification Code
                    </label>
                    <input
                      type='text'
                      id='otp'
                      className='form-input'
                      placeholder='Enter the OTP code'
                      value={inOtp}
                      onChange={e => setInOpt(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className='form-actions'>
                    <Buttons
                      text='Submit'
                      borderRadius='50px'
                      width='125px'
                      height='50px'
                      marginTop='20px'
                    />
                  </div>
                </>
              )}

              {errorMessage && (
                <div className='error-message' role='alert'>
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
