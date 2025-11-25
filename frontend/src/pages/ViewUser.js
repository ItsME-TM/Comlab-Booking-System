import React, { useState, useRef, useEffect } from 'react';
import HeaderAdmin from '../components/HeaderAdmin';
import '../components/viewuser.css';
import Profile from '../components/Profile';
import Buttons from '../components/editButton';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const token = localStorage.getItem('token');
console.log('token from viewuser.js:', token);

export default function ViewUser() {
  const [deleteUser, setDeleteUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('lecturer');
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/getall', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        console.log('users from viewuser.js:', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleRoleClick = role => {
    setSelectedRole(role);
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };
  const handleClickOutside = event => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsBoxVisible(false);
    }
  };

  useEffect(() => {
    if (isBoxVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBoxVisible]);

  const handleEditButtonClick = edituser_id => {
    console.log('edit user button clicked for user:', edituser_id);

    navigate('/editUser', { state: { id: edituser_id } });
  };

  const handleRemoveButtonClick = user => {
    console.log('handleRemoveButtonClick function:', user);
    setDeleteUser(user);
    setShowConfirmationDialog(true);
  };

  const handleRemoveConfirmation = async () => {
    if (deleteUser) {
      console.log('handleRemoveConfirmation function:', deleteUser);
      try {
        await axios.delete(`/api/users/${deleteUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(users.filter(user => user._id !== deleteUser._id));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
      setDeleteUser(null);
      setShowConfirmationDialog(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationDialog(false);
    setDeleteUser(null);
  };

  const filteredUsers = users.filter(user => user.role === selectedRole);

  return (
    <div>
      <HeaderAdmin
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <hr
        style={{
          height: '1px',
          backgroundColor: 'black',
          borderStyle: 'none',
          margin: 0,
        }}
      />
      <div className='viewuser-container'>
        <div className='left-side-admin'>
          <h2 className='title-admin'>Users</h2>
          <ul className='role-list'>
            <li
              onClick={() => handleRoleClick('lecturer')}
              className={selectedRole === 'lecturer' ? 'selected' : ''}
            >
              Lecturers
            </li>
            <li
              onClick={() => handleRoleClick('instructor')}
              className={selectedRole === 'instructor' ? 'selected' : ''}
            >
              Instructors
            </li>
            <li
              onClick={() => handleRoleClick('to')}
              className={selectedRole === 'to' ? 'selected' : ''}
            >
              TO
            </li>
          </ul>
        </div>
        <div className='right-side-admin'>
          <h3 className='role-title'>{selectedRole}</h3>
          <table className='user-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.firstName}</td>
                  <td>{user.email}</td>
                  <div className='button-row'>
                    <Buttons
                      text='Edit'
                      borderRadius='20px'
                      width='65px'
                      height='42px'
                      marginTop='20px'
                      onClick={() => {
                        handleEditButtonClick(user._id);
                        console.log('Hit the edit button');
                      }}
                    />
                    <Buttons
                      text='Remove'
                      borderRadius='20px'
                      width='100px'
                      height='42px'
                      marginTop='20px'
                      marginLeft='50px'
                      onClick={() => {
                        handleRemoveButtonClick(user);
                        console.log('Hit the remove button', user);
                      }}
                    />
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isBoxVisible && <Profile profileRef={profileRef} />}
        {showConfirmationDialog && (
          <ConfirmationDialog
            onConfirm={handleRemoveConfirmation}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </div>
  );
}
