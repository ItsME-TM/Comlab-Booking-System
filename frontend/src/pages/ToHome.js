import React, { useState } from 'react';
import ToHeader from '../components/ToHeder';
import frontOfAdminImage from  '../images/adminhome_backgroundjpg.jpg'
import Profile from '../components/Profile'
import '../components/adminhome.css'

export default function ToHome() {

  const [isBoxVisible, setIsBoxVisible] = useState(false);

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  return (
    <div className='admin_home_main_container'>
        <ToHeader onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible}/>
        <div className='admin_home_body'>
        <div className='image-container-admin'>
          <img src={frontOfAdminImage} alt="university-photograph2" className='frontOfAdminImage' />
          <div className='text-container-admin-home'>
            <h1 className='text-h1' >
              Welcome to the CO1 Lab Booking System
            </h1>
            <h3 className='text-h3' style={{ fontFamily: 'Roboto, serif'}}>Faculty of Engineering - University of Jaffna</h3>
          </div>
        </div>
      </div>
        {isBoxVisible && <Profile />}
    </div>
  )
}
