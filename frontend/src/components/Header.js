import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/images/user.png';
import './styles.css';
import '../components/header.css';
import Buttons from '../components/Buttons';
import userIcon from '../images/user.png';
import notificationIcon from '../images/notification.jpg';

export default function Header({ onUserIconClick, isProfileVisible }) {
  const location = useLocation();

  return (
    <div>
      <Navbar className='navbar-green' expand='lg'>
        <Container>
          <Navbar.Brand href='#Home'>
            <div className='d-flex flex-column align-items-center w-100'>
              <div
                className='d-flex align-items-center'
                style={{ height: '70px' }}
              >
                <img
                  alt=''
                  src={logo}
                  style={{
                    width: '80px',
                    height: '80px',
                    marginRight: '40px',
                    marginLeft: '18px',
                  }}
                />
                <div>
                  <h3
                    style={{
                      fontWeight: '700',
                      color: '#205464',
                      textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    CO1 Lab Booking System
                  </h3>
                  <p
                    style={{
                      color: '#205464',
                      fontWeight: '400',
                      fontSize: '18px',
                      lineHeight: '24px',
                    }}
                  >
                    Faculty of Engineering - University of Jaffna
                  </p>
                </div>
              </div>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls='basic-navbar-nav'
            style={{ marginTop: '15px', width: '70px' }}
          />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ml-auto justify-content-end w-100'>
              <div className='buttons-container' style={{ marginTop: '10px' }}>
                <Link to='/dashboard'>
                  <Buttons
                    text='Home'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/dashboard' ? 'active-button' : ''
                    }
                  />
                </Link>
                <Link to='/booking'>
                  <Buttons
                    text='Booking'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/booking' ? 'active-button' : ''
                    }
                  />
                </Link>
                <Link to='/view'>
                  <Buttons
                    text='View'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/view' ? 'active-button' : ''
                    }
                  />
                </Link>
                <Link to='/Notification'>
                  <img
                    src={notificationIcon}
                    alt='notf-icon'
                    className={`notificationIcon ${location.pathname === '/Notification' ? 'active-page' : ''}`}
                  />
                </Link>
                <div
                  className={`userIcon ${isProfileVisible ? 'active' : ''} ${location.pathname === '/user' ? 'active-page' : ''}`}
                  onClick={onUserIconClick}
                >
                  <img src={userIcon} alt='user-icon' />
                </div>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

Header.propTypes = {
  onUserIconClick: PropTypes.func.isRequired,
  isProfileVisible: PropTypes.bool.isRequired,
};
