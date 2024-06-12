import React from 'react'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from '../components/navBarBL';
import logo from './logo.ico'; 
import './styles.css';
import '../components/header.css'
import Buttons from '../components/Buttons'
import userIcon from '../images/user.png'
import notificationIcon from '../images/notification.jpg'
import { Link } from 'react-router-dom';


export default function Header() {
  return (
    <div>
      <Navbar className="navbar-green">
        <Container>
            <Navbar.Brand href="#Home">
              <div className="d-flex align-items-center">
                <img
                  alt=""
                  src={logo}
                  style={{ width: '30px', height: '30px', marginRight: '10px' }}
                />
                <div>
                  <h3>CO1 Lab Booking System</h3>
                  <p>Faculty of Engineering - University of Jaffna</p>
                </div>
              </div>
            </Navbar.Brand>   
            <Nav>
              <div className='buttons-container'>
              <Link to="/dashboard"> 
                <Buttons text="Home"  borderRadius="50px" width="90px"  />
              </Link>
                <Buttons text="Booking"  borderRadius="50px" width="90px"  />
                <Buttons text="View"  borderRadius="50px" width="90px"  />
                <img src={notificationIcon} alt="notf-icon" className='notificationIcon' />
                <Link to="/user"> 
                  <img src={userIcon} alt="user-icon" className='userIcon' />
                </Link>
                
              </div>
                
                

            </Nav>
        </Container>
      </Navbar>
    
    </div>
  )
}
