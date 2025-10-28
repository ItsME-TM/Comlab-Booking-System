import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserInputs from '../UserInputs';

describe('UserInputs Component', () => {
  const mockUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'Lecturer'
  };

  test('renders user information correctly', () => {
    render(<UserInputs userData={mockUserData} />);
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lecturer')).toBeInTheDocument();
  });

  test('displays masked password initially', () => {
    render(<UserInputs userData={mockUserData} />);
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveValue('***********');
    expect(passwordInput).toHaveAttribute('readonly');
  });

  test('enables password editing when change button is clicked', () => {
    render(<UserInputs userData={mockUserData} />);
    
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveValue('password123');
    expect(passwordInput).not.toHaveAttribute('readonly');
    expect(passwordInput).toHaveFocus();
  });

  test('exits edit mode when password input loses focus', () => {
    render(<UserInputs userData={mockUserData} />);
    
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    fireEvent.blur(passwordInput);
    
    expect(passwordInput).toHaveValue('***********');
    expect(passwordInput).toHaveAttribute('readonly');
  });

  test('updates password value during editing', () => {
    render(<UserInputs userData={mockUserData} />);
    
    const changeButton = screen.getByText('Change');
    fireEvent.click(changeButton);
    
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    
    expect(passwordInput).toHaveValue('newpassword123');
  });

  test('handles empty userData gracefully', () => {
    render(<UserInputs userData={{}} />);
    
    expect(screen.getByDisplayValue(' ')).toBeInTheDocument(); // firstName + lastName
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // email
  });

  test('updates when userData prop changes', () => {
    const { rerender } = render(<UserInputs userData={mockUserData} />);
    
    const updatedUserData = {
      ...mockUserData,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };
    
    rerender(<UserInputs userData={updatedUserData} />);
    
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane.smith@example.com')).toBeInTheDocument();
  });

  test('prevents form submission', () => {
    const mockSubmit = jest.fn();
    render(
      <form onSubmit={mockSubmit}>
        <UserInputs userData={mockUserData} />
      </form>
    );
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});