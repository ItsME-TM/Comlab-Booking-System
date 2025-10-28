import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../components/uplode.css';

const EditImg = () => {
  const [image, setImage] = useState(null);
  const [userId, setId] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [userData, setUser] = useState({});

  useEffect(() => {
    if (location.state && location.state.id) {
      setId(location.state.id);
    }
  }, [location.state]);

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
      setUser({});
    }
  }, [token]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!image) {
      alert('Please select an image to upload');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId);

    try {
      const res = await axios.post('/api/images/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.msg);
      navigateToUserRolePage();
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigateToUserRolePage();
  };

  const navigateToUserRolePage = () => {
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

  return (
    <div className='unique-body-background'>
      <div className='unique-upload-container'>
        <h1 className='unique-header'>Upload Image</h1>
        <form className='unique-form' onSubmit={handleSubmit}>
          <div className='unique-image-preview'>
            {preview ? (
              <img
                className='unique-image-preview-img'
                src={preview}
                alt='Image Preview'
              />
            ) : (
              <p>No image selected</p>
            )}
          </div>
          <input
            className='unique-file-input'
            type='file'
            onChange={handleImageChange}
            required
          />
          <div className='unique-button-group'>
            <button
              className='unique-button unique-button-submit'
              type='submit'
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              className='unique-button unique-button-cancel'
              type='button'
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditImg;
