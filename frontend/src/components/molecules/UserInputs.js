import React, { useState, useEffect } from 'react';
import './UserInputs.css';

export default function UserInputs({ userData }) {
  const [editMode, setEditMode] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Lecturer' // Assuming role is static
  });

  useEffect(() => {
    // Update local state when userData changes
    setUserDetails(userData);
  }, [userData]);

  const handlePasswordChange = (event) => {
    const { value } = event.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      password: value
    }));
  };

  const handleChangeClick = (event) => {
    event.preventDefault(); // Prevent form submission
    setEditMode(true);
  };

  const handlePasswordBlur = () => {
    setEditMode(false);
    // Implement the logic to save the new password to the context or server here
    // For example: updateUserData(userDetails);
  };

  return (
    <div className='userInputs'>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="name" className="input-label">Name</label><br />
        <input
          type="text"
          id="name"
          name="name"
          className="input-field"
          value={`${userDetails.firstName} ${userDetails.lastName}`}
          readOnly
        /><br />

        <label htmlFor="password" className="input-label">Password</label><br />
        <div className="input-wrapper">
          {editMode ? (
            <input
              type="password"
              id="password"
              name="password"
              className="input-field-password"
              value={userDetails.password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur} // Save password on blur
              autoFocus // Automatically focus the password input when in edit mode
            />
          ) : (
            <input
              type="password"
              id="password"
              name="password"
              className="input-field-password"
              value={userDetails.password ? userDetails.password.replace(/./g, '*') : ''}
              readOnly
            />
          )}
          <button className="changeButton" style={{border:'solid, 2px', padding:'3px'}} onClick={handleChangeClick}>Change</button>
        </div>

        <label htmlFor="email" className="input-label">Email</label><br />
        <input
          type="text"
          id="email"
          name="email"
          className="input-field"
          value={userDetails.email}
          readOnly
        /><br />

        <label htmlFor="role" className="input-label">Role</label><br />
        <input
          type="text"
          id="role"
          name="role"
          className="input-field"
          value={userDetails.role}
          readOnly
        /><br />
      </form>
    </div>
  );
}