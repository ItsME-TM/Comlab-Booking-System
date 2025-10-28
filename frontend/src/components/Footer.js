import React from 'react';
import '../components/Footer.css';

export default function Footer() {
  return (
    <footer class='footer'>
      Contact us: Email:{' '}
      <a class='link' href='mailto:info@example.com'>
        info@example.com
      </a>
      | Fax: (123) 456-7890 | Tel: (123) 456-7890
    </footer>
  );
}
