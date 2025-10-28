import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import Button from '../atoms/Button';
import logo from '../../assets/images/logo.ico';
import './NavBarBL.css';

function NavBarBL() {
  return (
    <>
      <Navbar className='navbar-green'>
        <Container>
          <Navbar.Brand href='#Home'>
            <div className='d-flex align-items-center'>
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
          <Nav>
            <Link to='/adminlogin' className='ml-auto'>
              <Button text='Admin' borderRadius='0' width='95px' />
            </Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBarBL;
