import React from 'react';
import '../components/errormsg.css';
import { Link } from 'react-router-dom';

export default function Errmsg() {
  return (
    <div className='page-container'>
      <div className='msg-container-error'>
        <h1 className='title'>Sign in</h1>
        <p className='error-message'>
          Sign-in is blocked!
          <br />
          You've tried to sign in too many times with an incorrect account or
          password.
        </p>
        <Link to='/userSingIn' className='link'>
          Sign in using another account
        </Link>
      </div>
    </div>
  );
}
