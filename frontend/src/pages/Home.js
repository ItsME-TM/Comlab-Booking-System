import React from 'react'
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import NavBarBL from '../components/navBarBL';
import '../App.css';


export default function Home() {
  return (
    <div style={{backgroundColor: 'white', height: '100vh'}}>
        <NavBarBL/>
       <div className="App" >
          <h1>CO1 Lab Booking</h1>
          <h1>System</h1>
          <h3>Welcome to the Lab Booking System Dashboard!</h3>
          <h6>Reserve Lab Spaces: Book lab sessions seamlessly.</h6>
          <h6>Check availability, confirm bookings, and manage your lab schedule</h6>
          <Link to="/dashboard">Go to the user dashboard</Link>
        </div>
    </div>
  )
}
