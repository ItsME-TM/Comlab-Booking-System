import React from 'react';
import { useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from './logo.ico'; 
import './styles.css';
import '../components/header.css';
import Buttons from '../components/Buttons';
import userIcon from '../images/user.png';
import { Link } from 'react-router-dom';

export default function AdminHeader({ onUserIconClick, isProfileVisible }) {
  const location = useLocation();  // Get the current location object

  return (
    <div>
      <Navbar className="navbar-green">
        <Container>
          <Navbar.Brand href="#Home">
            <div className="d-flex align-items-center">
              <img
                alt=""
                src={logo}
                style={{ width: '80px', height: '80px', marginRight: '40px', marginLeft: '18px' }}
              />
              <div>
                <h3 style={{ fontWeight: '700', color: '#205464', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>CO1 Lab Booking System</h3>
                <p style={{ color: '#205464', fontWeight: '400', fontSize: '18px', lineHeight: '24px' }}>Faculty of Engineering - University of Jaffna</p>
              </div>
            </div>
          </Navbar.Brand>
          <Nav>
            <div className='buttons-container'>
              <Link to="/dashboard">
                <Buttons 
                  text="Home" 
                  borderRadius="50px" 
                  width="110px" 
                  className={location.pathname === '/dashboard' ? 'active-button' : ''}/>
              </Link>
              <Link to="/AddUser">
                <Buttons 
                  text="Add User"
                  borderRadius="50px" 
                  width="110px" 
                  className={location.pathname === '/booking' ? 'active-button' : ''}/>
              </Link>
              <Link to="/UserList">
                <Buttons 
                  text="View User" 
                  borderRadius="50px" 
                  width="110px" 
                  className={location.pathname === '/view' ? 'active-button' : ''} 
                />
              </Link>
              <div className={`userIcon ${isProfileVisible ? 'active' : ''} ${location.pathname === '/user' ? 'active-page' : ''}`}
                    onClick={onUserIconClick}>
                    <img src={userIcon} alt="user-icon" />
              </div>

            </div>
          </Nav>
        </Container>
      </Navbar>
    </div>
  );
}
