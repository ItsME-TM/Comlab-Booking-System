import React, { useState,useRef, useEffect } from 'react';
import HeaderAdmin from '../components/HeaderAdmin';
import frontOfAdminImage from '../images/adminhome_backgroundjpg.jpg';
import Profile from '../components/Profile';
import '../components/adminhome.css';

export default function AdminHome() {
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const profileRef = useRef(null);

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleClickOutside = (event) => {
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

  return (
    <div>
      <HeaderAdmin onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className='admin_home_body'>
        <div className='image-container-admin'>
          <img src={frontOfAdminImage} alt="university-photograph2" className='frontOfAdminImage' />
          <div className='text-container-admin-home'>
            <h1 className='text' style={{ fontFamily: 'Roboto Slab, serif', fontSize: '64px', fontWeight: '400', lineHeight: '88px', textAlign: 'center', color: 'white', marginLeft: 0 }}>
              Welcome to the CO1 Lab Booking System
            </h1>
            <h3 className='text'>Faculty of Engineering - University of Jaffna</h3>
          </div>
        </div>
      </div>
      {isBoxVisible && <Profile profileRef={profileRef} />}
    </div>
  );
}
