import React, { useState,useRef, useEffect  } from 'react';
import Header from '../components/Header'
import uniImage from  '../images/university-photo.jpg'
import '../components/dashboard.css'
import Profile from '../components/Profile'


export default function Dashboard() {

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
    <div className='dashboard_body'>
        <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible}/>
        <div className='text-container'>
        <h1  className='text' style={{ fontFamily: 'Roboto Slab, serif', fontSize: '68px', fontWeight: '400', lineHeight: '88px', textAlign: 'center', color: 'white', marginLeft: 0 }}>Welcome to the CO1 Lab Booking System</h1>
          <h3 className='text' >Faculty of Engineering - University of Jaffna</h3>
        </div>
        <div className='image-container'>
          <img src={uniImage} alt="university-photograph" className='uniImage'/>
        </div>

        {isBoxVisible && <Profile profileRef={profileRef} />}
       
       
    </div>
  )
}
