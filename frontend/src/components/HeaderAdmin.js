import React from 'react';
import { useLocation } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../assets/images/user.png';
import './styles.css';
import '../components/header.css';
import Buttons from '../components/Buttons';
import userIcon from '../images/user.png';
import { Link } from 'react-router-dom';

export default function HeaderAdmin({ onUserIconClick, isProfileVisible }) {
  const location = useLocation(); // Get the current location object

  return (
    <div>
      <Navbar className='navbar-green' expand='lg'>
        <Container>
          <Navbar.Brand href='#Home'>
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
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls='basic-navbar-nav'
            style={{ marginTop: '15px', width: '70px' }}
          />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              <div className='buttons-container' style={{ marginTop: '10px' }}>
                <Link to='/adminhome'>
                  <Buttons
                    text='Home'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/adminhome' ? 'active-button' : ''
                    }
                  />
                </Link>
                <Link to='/adduser'>
                  <Buttons
                    text='Add User'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/adduser' ? 'active-button' : ''
                    }
                  />
                </Link>
                <Link to='/viewuser'>
                  <Buttons
                    text='View User'
                    borderRadius='50px'
                    width='110px'
                    className={
                      location.pathname === '/viewuser' ? 'active-button' : ''
                    }
                  />
                </Link>

                <div
                  className={`userIcon ${isProfileVisible ? 'active' : ''} ${location.pathname === '/adminprofile' ? 'active-page' : ''}`}
                  onClick={onUserIconClick}
                >
                  <img
                    src={userIcon}
                    alt='user-icon'
                    style={{ marginLeft: '80px' }}
                  />
                </div>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
