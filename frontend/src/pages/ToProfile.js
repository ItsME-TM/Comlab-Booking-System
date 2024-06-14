import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Link, useLocation } from 'react-router-dom';
import '../components/user.css';
import userImage from '../images/user-image.png';
import Buttons from '../components/submitButton';
import '../App.css';
import ToHeader from '../components/ToHeder';
import Profile from '../components/Profile';
import '../components/userInputs.css';
import axios from 'axios';

export default function ToProfile() {
  const [id, setId] = useState('');
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [textContainerText, setTextContainerText] = useState("Your Account");
  const navigate = useNavigate();
  
  const location = useLocation();
  const token = localStorage.getItem('token');
  console.log(location.state);
  
  useEffect(() => {
    if (location.state && location.state.id) {
      setId(location.state.id);
    }
  }, [location.state]);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/users/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const user = response.data;
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setEmail(user.email);
          setRole(user.role);
          console.log('Fetched user:', user);
          setTextContainerText("Edit User Details");
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

      fetchUser();
    }
  }, [id, token]);

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role
    };

    try {
      let response;
      if (id) {
        response = await axios.put(`/api/users/${id}`, userData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        alert('User updated successfully!');
      } else {
        response = await axios.post('/api/users/add', userData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        alert('User added successfully!');
      }
      console.log('Save user response:', response.data);
      navigate('/adminhome'); 
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleChangeClick = () => {
    navigate('/forgotpassword');
  };

  return (    
    <div className='main-container'>
      <ToHeader onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible}/>
      <div className='container-1'>
        <div className='container-2'>
          <div className='user-logo-details'>
            <h3 className='text-1'>{textContainerText}</h3>
            <img src={userImage} alt="user-photograph" className='userImage' />
            <Buttons text="Edit" />
          </div>

          <div className='user-input-details'>
            <div className="inputs-wrapper">
              <div className='userInputs'>
                <form onSubmit={handleSave}>  
                  <label htmlFor="name" className="input-label">Name</label><br />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input-field"
                    value={`${firstName} ${lastName}`}
                    onChange={(e) => {
                      const [first, ...last] = e.target.value.split(" ");
                      setFirstName(first);
                      setLastName(last.join(" "));
                    }}
                  /><br />
                  <label htmlFor="password" className="input-label">Password</label><br />
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="input-field-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    /><br />
                    <button type="button" className="changeButton" onClick={handleChangeClick}>Change</button>
                  </div>
                  <label htmlFor="email" className="input-label">Email</label><br />
                  <input
                    type="text"
                    id="email"
                    name="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  /><br />
                  <label htmlFor="role" className="input-label">Role</label><br />
                  <select
                    id="role"
                    name="role"
                    className="input-field"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="to">To</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="instructor">Instructor</option>
                  </select><br />
                  <div className="buttons" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Buttons type="submit" text="Save" borderRadius="50px" width="125px" height="50px" marginTop="20px" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isBoxVisible && <Profile />}
    </div>
  );
}
