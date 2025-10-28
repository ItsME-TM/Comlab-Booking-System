import React from 'react';
import Header from '../components/Header';
import uniImage from '../images/university-photo.jpg';
import '../components/dashboard.css';

export default function Dashboard() {
  return (
    <div>
      <Header />
      <div className='text-container'>
        <h1
          className='text'
          style={{
            fontFamily: 'Roboto Slab, serif',
            fontSize: '68px',
            fontWeight: '400',
            lineHeight: '88px',
            textAlign: 'center',
            color: 'white',
            marginLeft: 0,
          }}
        >
          Welcome to the CO1 Lab Booking System
        </h1>
        <h3 className='text'>Faculty of Engineering - University of Jaffna</h3>
      </div>
      <div className='image-container'>
        <img src={uniImage} alt='university-photograph' className='uniImage' />
      </div>
    </div>
  );
}
