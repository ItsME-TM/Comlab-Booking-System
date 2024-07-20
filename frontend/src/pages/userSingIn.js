import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/signIn.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Buttons from '../components/submitButton';
import EntranceImage from  '../images/entrance.jpg'

export default function UserSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const navigate = useNavigate();

  const sendData = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password
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
      setFailedAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          navigate('/errmsg');
        }
        return newAttempts;
      });
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Server error');
      }
    }
  };

  return (
    <div>
      
      <div className="page-container-login">
        <div className="form-container-login">
          <h1>Log in</h1>
          <h3>Sign in to continue</h3>
          <form className="form-signin" onSubmit={sendData}>
            <div className="form-group-login">
              <label htmlFor="email" className="label">Email</label>
              <input
                type="email"
                id="email"
                className="input-1"
                placeholder="Enter the email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group-login">
              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                className="input-1"
                placeholder="Enter the password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="forgot-password-1">
              <Link to="/forgotpassword" style={{textDecoration:'underline'}}>Forgot password?</Link>
            </div>
            <div className="buttons">
                <Buttons text="Log in" borderRadius="50px" width="125px"  height="50px" marginTop="20px" /> 
            </div>
          </form>
          {errorMessage && <p className="error-message-login">{errorMessage}</p>}
        </div>
        {/* Oblique line divider */}
        {/* <div className="oblique-line" style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'10px' , left:'88%'}}></div>
      <div className="oblique-line" style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'5px', left:'85%'}}></div>  
      <div className="oblique-line"style={{borderColor:'#1D4C5A', borderStyle:'solid', borderWidth:'3px', left:'82%'}}></div> */}
      </div>
      <div className="image-container-login"  >
      <img src={EntranceImage} alt="university-photograph-entrance" className='EntranceUniImage'/>
      </div>
      
    </div>
  );
}
