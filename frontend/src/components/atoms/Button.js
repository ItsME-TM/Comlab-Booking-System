import React from 'react';
import BootstrapButton from 'react-bootstrap/Button';
import './Button.css';

export default function Button({ text, borderRadius, width, marginTop, className, variant = "outline-light", onClick, type = "button" }) {
  const buttonStyle = {
    borderRadius: borderRadius,
    width: width,
    marginTop: marginTop,
  };

  return (
    <BootstrapButton 
      variant={variant} 
      className={`button ${className}`} 
      style={buttonStyle}
      onClick={onClick}
      type={type}
    >
      {text}
    </BootstrapButton>
  );
}