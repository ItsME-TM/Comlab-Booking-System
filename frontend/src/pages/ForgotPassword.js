import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/forgotPassword.css';
import '../components/signIn.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Buttons from '../components/Buttons'
import FacultyImage from '../images/faculty.jpg'

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const sendData = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
      otp
    };

    try {
      console.log('Attempting to log in with:', loginData);
      const response = await axios.post('/api/auth/login', loginData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Login response:', response);
      alert('Admin Login Successful');
      navigate('/userSingIn');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Server error');
      }
    }
  };

  return (
    <div className='main-page-container-forgot-password'>
      <div className="image-container-forgot-password"  >
      <img src={FacultyImage} alt="university-photograph-entrance" className='FacultyImage'/>
      </div>

      

      <div className="page-container-forgot-password">
        <div className="form-container-forgot-password">
          
          <form className="form" onSubmit={sendData}>
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
                <Link to="#">
                  <Buttons className="get-code-button" text="Get Code" borderRadius="10px" width="95px" />
                </Link>
              </div>
            </div>

            
            <div className="form-group-forgot-password">
              <label htmlFor="password" className="label">New Password</label>
              <input
                type="password"
                id="password"
                className="input"
                placeholder="Enter the password"
         
              />
            </div>

            <div className="form-group-forgot-password">
              <label htmlFor="password" className="label">Confirm Password</label>
              <input
                type="password"
                id="password"
                className="input"
                placeholder="Enter the password"
                onChange={(e) => setPassword(e.target.value)}
                
              />
            </div>

            <div className="form-group-forgot-password">
              <label htmlFor="otp" className="label">OTP</label>
              <input
                type="text"
                id="otp"
                className="input"
                placeholder="Enter the OTP code"
              
              />
            </div>
            
            <Buttons type="submit" text="Submit"  borderRadius="50px" width="125px" height="50px" marginTop="20px" />
          </form>
        </div>
        {/* Oblique line divider */}
        <div className="oblique-line" style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'10px' , left:'12%'}}></div>
      <div className="oblique-line" style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'5px', left:'15%'}}></div>  
      <div className="oblique-line"style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'3px', left:'18%'}}></div>
      
      </div>
      
    </div>
  );
}
