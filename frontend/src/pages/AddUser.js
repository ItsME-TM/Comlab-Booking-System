import React, { useState, useRef, useEffect } from 'react';
import HeaderAdmin from '../components/HeaderAdmin';
import Buttons from '../components/submitButton';
import UserImageAdmin from '../images/user-image.png';
import { Link } from 'react-router-dom';
import '../components/adduser.css';
import Profile from '../components/Profile';
import axios from 'axios';

export default function AddUser() {
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const profileRef = useRef(null);

  const token = localStorage.getItem('token');

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

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const generateRandomPassword = () => {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*&';
    let password = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      password += characters[randomIndex];
    }
    return password;
  };

  const handleSave = async event => {
    event.preventDefault();
    const password = generateRandomPassword();
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
    };

    console.log('Attempting to add user with:', userData);
    try {
      await axios.post('/api/users/add', userData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('User added successfully!');

      const response = await axios.get('/api/users/getall', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const foundUser = response.data.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('User not found after creation');
      }

      const userId = foundUser._id;
      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', userId);

      try {
        const res = await axios.post('/api/images/edit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        alert(res.data.msg);
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Error uploading image');
      }
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Error adding user');
    }
  };

  return (
    <div className='main-container-admin'>
      <HeaderAdmin
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <hr />
      <div className='container-1-admin'>
        <div className='container-2-admin'>
          <h3 className='text-container-admin'>Add User Details</h3>
          <div className='user-input-details-admin'>
            <form onSubmit={handleSave}>
              <label htmlFor='firstName' className='input-label-admin'>
                First Name
              </label>
              <br />
              <input
                type='text'
                id='firstName'
                name='firstName'
                className='input-field-admin'
                onChange={e => setFirstName(e.target.value)}
              />
              <br />

              <label htmlFor='lastName' className='input-label-admin'>
                Last Name
              </label>
              <br />
              <input
                type='text'
                id='lastName'
                name='lastName'
                className='input-field-admin'
                onChange={e => setLastName(e.target.value)}
              />
              <br />

              <label htmlFor='email' className='input-label-admin'>
                Email
              </label>
              <br />
              <input
                type='text'
                id='email'
                name='email'
                className='input-field-admin'
                onChange={e => setEmail(e.target.value)}
              />
              <br />

              <label htmlFor='role' className='input-label-admin'>
                Role
              </label>
              <br />
              <select
                id='role'
                name='role'
                className='input-field-admin'
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value=''></option>
                <option value='to'>To</option>
                <option value='lecturer'>Lecturer</option>
                <option value='instructor'>Instructor</option>
              </select>
              <br />
              <input type='file' onChange={handleImageChange} required />
              <br />
              {imagePreviewUrl && <p>Selected image: {imagePreviewUrl}</p>}

              <div className='buttons'>
                <Buttons
                  type='submit'
                  text='Save'
                  borderRadius='50px'
                  width='125px'
                  height='50px'
                  marginTop='20px'
                />
                <Link to='/adminhome'>
                  <Buttons
                    text='Cancel'
                    borderRadius='50px'
                    width='125px'
                    height='50px'
                    marginTop='20px'
                  />
                </Link>
              </div>
            </form>
          </div>
        </div>
        <div className='container-3-main-admin'>
          <div className='container-3-admin'>
            <div className='user-logo-details-admin'>
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt='Selected user'
                  className='userImageAdmin'
                />
              ) : (
                <img
                  src={UserImageAdmin}
                  alt='user-photograph'
                  className='userImageAdmin'
                />
              )}
            </div>
          </div>
        </div>

        {isBoxVisible && <Profile profileRef={profileRef} />}
      </div>
    </div>
  );
}
