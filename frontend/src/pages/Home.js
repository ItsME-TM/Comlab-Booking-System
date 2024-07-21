import React from 'react';
import { Link } from 'react-router-dom';
import NavBarBL from '../components/navBarBL';
import '../components/home.css';
import Buttons from '../components/Buttons';

export default function Home() {
  return (
    <div className='hhh'>
      <NavBarBL/>
      <div className='home'>
        <div className='text-home'>
          <h1>CO1 Lab Booking System</h1>
          <h3>Welcome to the Lab Booking System Dashboard!</h3>
          <p>
            Reserve Lab Spaces: Book lab sessions seamlessly.<br />
            Check availability, confirm bookings, and manage your lab schedule<br />
          </p>
          <div className='button-row'>
            <Link to="/userSingIn">
              <Buttons text="Sign in" borderRadius="0" width="95px" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
