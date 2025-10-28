import React, { useState, useEffect } from 'react';
import userIconProfile from '../images/user.png';
import Buttons from '../components/editButton';
import { Link, useNavigate } from 'react-router-dom';
import settingIcon from '../images/setting_icon.png';
import '../components/profile.css';
import axios from 'axios';

export default function Profile({ profileRef }) {
  const navigate = useNavigate();
  const [userData, setUser] = useState([]);
  const token = localStorage.getItem('token');
  console.log('token from admin profile component:', token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/tokenUser', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        console.log('setUserdata', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser('');
    }
  }, [token]);

  const handleProfileSettingsClick = () => {
    if (userData.role === 'admin') {
      navigate('/adminprofile', { state: { id: userData._id } });
    } else if (userData.role === 'to') {
      navigate('/toProfile', { state: { id: userData._id } });
    } else if (userData.role === 'lecturer') {
      navigate('/lecturerInstructorProfile', { state: { id: userData._id } });
    } else if (userData.role === 'instructor') {
      navigate('/lecturerInstructorProfile', { state: { id: userData._id } });
    } else {
      navigate('/');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUser('');
  };

  return (
    <div className='profile-container' ref={profileRef}>
      <div className='containerProfile-2'>
        <img
          src={`/api/images/get/${userData._id}`}
          alt='user-icon'
          className='userIconProfile'
          onError={e => {
            e.target.onerror = null;
            e.target.src = userIconProfile;
          }}
        />
        <div className='info'>
          <h4
            style={{
              fontSize: '24px',
              lineHeight: '36px',
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            {`${userData.firstName} ${userData.lastName}`}
          </h4>
          <h4
            style={{
              fontSize: '18px',
              lineHeight: '24px',
              textAlign: 'center',
              fontWeight: '400',
            }}
          >
            {userData.email}
          </h4>
        </div>
        <Link to='/'>
          <Buttons
            text='Sign out'
            borderRadius='50px'
            width='175px'
            height='60px'
            marginTop='25px'
            onClick={handleSignOut}
          />
        </Link>
      </div>
      <div className='containerProfile-3'>
        <img src={settingIcon} alt='setting-icon' className='settingIcon' />
        <span
          className='profile-settings-text'
          onClick={handleProfileSettingsClick}
        >
          Profile settings
        </span>
      </div>
    </div>
  );
}
