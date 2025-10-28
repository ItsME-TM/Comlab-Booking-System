import React from 'react';
import BootstrapButton from 'react-bootstrap/Button';
import '../components/buttons.css';

export default function Buttons({
  text,
  borderRadius,
  width,
  marginTop,
  className,
  onClick,
}) {
  const buttonStyle = {
    borderRadius: borderRadius,
    width: width,
    marginTop: marginTop,
  };

  return (
    <div>
      <BootstrapButton
        variant='outline-light'
        className={`button ${className}`}
        style={buttonStyle}
        onClick={onClick}
      >
        {text}
      </BootstrapButton>{' '}
    </div>
  );
}
