import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/atoms';
import FacultyImage from '../../assets/images/faculty.jpg';
import BeatLoader from "react-spinners/BeatLoader";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [inOtp, setInOpt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500)
  }, []);

  const sendData = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      password
    };

    try {
      let response;

      if (password === confirmPassword && otp === inOtp) {
        response = await axios.post('/api/users/update-password', userData);

        alert('Password updated successfully!');
        console.log('Update password response:', response.data);
        navigate('/userSingIn');
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
    setLoading(true);
    try {
      const response = await axios.get(`/api/users/verify-email?email=${email}`);

      setMessage(response.data.message);
      setOtp(response.data.otp);
      setEmail(response.data.email);

      if (response.data.message === 'Email found') {
        setIsCodeSent(true);
        setErrorMessage('');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Server i error');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='main-page-container-forgot-password'>
      <div className="image-container-forgot-password">
        <img src={FacultyImage} alt="university-photograph-entrance" className='FacultyImage' />
      </div>

      <div className="page-container-forgot-password">
        <div className="form-container-forgot-password">
          <form className="form-forgot" onSubmit={sendData}>
            <h1>Change Password</h1>
            <div className="form-group-forgot-password">
              <label htmlFor="email" className="label">Enter your email address below to get the code to your inbox</label>
              <div className="input-button-wrapper">
                <input
                  type="email"
                  id="email"
                  className="input-with-button"
                  placeholder="Enter the email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Link to="#" onClick={getCode}>
                  {loading ? (
                    <div className="loading-spinner">
                      <BeatLoader color={"#000000"} loading={true} size={20} />
                    </div>
                  ) : (
                    <Button className="get-code-button" text="Get Code" borderRadius="10px" width="95px" />
                  )}
                </Link>
              </div>
            </div>

            {isCodeSent && (
              <>
                <div className="form-group-forgot-password">
                  <label htmlFor="password" className="label">New Password</label>
                  <input
                    type="password"
                    id="password"
                    className="input-1"
                    placeholder="Enter the password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group-forgot-password">
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="input-1"
                    placeholder="Enter the password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="form-group-forgot-password">
                  <label htmlFor="otp" className="label">OTP</label>
                  <input
                    type="text"
                    id="otp"
                    className="input-1"
                    placeholder="Enter the OTP code"
                    onChange={(e) => setInOpt(e.target.value)}
                  />
                </div>
                <Button type="submit" text="Submit" borderRadius="50px" width="125px" height="50px" marginTop="20px" />
              </>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}

          </form>
        </div>
      </div>
    </div>
  );
}