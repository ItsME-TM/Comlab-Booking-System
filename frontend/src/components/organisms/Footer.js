import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className='footer'>
      Contact us: Email:{' '}
      <a className='link' href='mailto:info@example.com'>
        info@example.com
      </a>
      | Fax: (123) 456-7890 | Tel: (123) 456-7890
    </footer>
  );
}
