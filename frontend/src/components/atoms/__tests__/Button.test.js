import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button text="Click me" />);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('applies custom styles correctly', () => {
    render(
      <Button 
        text="Styled Button" 
        borderRadius="10px" 
        width="200px" 
        marginTop="20px"
        className="custom-class"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Styled Button' });
    expect(button).toHaveStyle({
      borderRadius: '10px',
      width: '200px',
      marginTop: '20px'
    });
    expect(button).toHaveClass('button', 'custom-class');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies correct variant', () => {
    render(<Button text="Primary Button" variant="primary" />);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toHaveClass('btn-primary');
  });

  test('sets correct button type', () => {
    render(<Button text="Submit" type="submit" />);
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('uses default props when not provided', () => {
    render(<Button text="Default Button" />);
    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toHaveClass('btn-outline-light');
    expect(button).toHaveAttribute('type', 'button');
  });
});