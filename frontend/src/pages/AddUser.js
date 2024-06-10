import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import userImage from '../images/user-image.png';
import Buttons from '../components/Buttons';
import '../components/AddUser.css';
import AdminHeader from '../components/AdminHeader';
import Profile from '../components/Profile'

export default function AddUser() {
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      const isValidDomain = value.endsWith('@eng.jfn.ac.lk');
      if (!isValidDomain) {
        alert('Please enter an email address ending with @eng.jfn.ac.lk');
      }
    }
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/add', user);
      alert('User added successfully');
      console.log(response.data);
      setUser({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        password: '',
      });
    } catch (error) {
      console.error(error);
      alert('Error adding user');
    }
  };

  const handleCancel = () => {
    navigate('/Dashboard');
  };

  return (
    <div className="addUser-PageContainer">
      <AdminHeader onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible}/>
      <div className="addUser-container">
        <div className="addUser-leftContainer">
          <h2 className="addUser-header">Add User Details</h2>
          <form onSubmit={handleSubmit} className="addUser-form">
            <div className="form-group">
              <label htmlFor="firstName" className="addUser-label">First Name:</label>
              <input
                name="firstName"
                id="firstName"
                placeholder="First Name"
                value={user.firstName}
                onChange={handleChange}
                className="addUser-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="addUser-label">Last Name:</label>
              <input
                name="lastName"
                placeholder="Last Name"
                value={user.lastName}
                onChange={handleChange}
                className="addUser-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="addUser-label">
                Email:
              </label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={handleChange}
                required
                className="addUser-input"
                // Option 1: Client-side validation (can be bypassed)
                // pattern=".+@eng.jfn.ac.lk"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="addUser-label">Password:</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={handleChange}
                required
                className="addUser-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="addUser-label">Role:</label>
              <select
                name="role"
                value={user.role}
                onChange={handleChange}
                required
                className="addUser-input"
              >
                <option value="">Select Role</option>
                <option value="to">TO</option>
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <div className="button-group">
              <button className="addUser-button" type="submit">Save</button>
              <button className="addUser-button" type="button" onClick={handleCancel}>Cancel</button>
            </div>
        </form>
      </div>
      <div className="addUser-rightContainer">
      <div className="addUser-img">
        <img src={userImage} alt="user-photograph" className='userImage' />
        <Buttons text="Add" />
      </div>
      </div>
      </div>
      {isBoxVisible && <Profile />}
    </div>
  );
}
