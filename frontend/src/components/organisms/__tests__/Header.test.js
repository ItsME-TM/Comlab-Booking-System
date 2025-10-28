import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Header from '../Header';

// Mock the router location
const mockLocation = {
  pathname: '/dashboard'
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

const HeaderWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Header Component', () => {
  const mockOnUserIconClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders header with logo and title', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    expect(screen.getByText('CO1 Lab Booking System')).toBeInTheDocument();
    expect(screen.getByText('Faculty of Engineering - University of Jaffna')).toBeInTheDocument();
    expect(screen.getByAltText('')).toBeInTheDocument(); // Logo image
  });

  test('renders navigation buttons', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  test('renders notification and user icons', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    expect(screen.getByAltText('notf-icon')).toBeInTheDocument();
    expect(screen.getByAltText('user-icon')).toBeInTheDocument();
  });

  test('calls onUserIconClick when user icon is clicked', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    const userIcon = screen.getByAltText('user-icon').closest('.userIcon');
    fireEvent.click(userIcon);

    expect(mockOnUserIconClick).toHaveBeenCalledTimes(1);
  });

  test('applies active class to current page button', () => {
    mockLocation.pathname = '/dashboard';
    
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    const homeButton = screen.getByText('Home').closest('button');
    expect(homeButton).toHaveClass('active-button');
  });

  test('applies active class to user icon when profile is visible', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} isProfileVisible={true} />
      </HeaderWrapper>
    );

    const userIcon = screen.getByAltText('user-icon').closest('.userIcon');
    expect(userIcon).toHaveClass('active');
  });

  test('applies active-page class when on user page', () => {
    mockLocation.pathname = '/user';
    
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    const userIcon = screen.getByAltText('user-icon').closest('.userIcon');
    expect(userIcon).toHaveClass('active-page');
  });

  test('applies active-page class to notification icon when on notification page', () => {
    mockLocation.pathname = '/Notification';
    
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    const notificationIcon = screen.getByAltText('notf-icon');
    expect(notificationIcon).toHaveClass('active-page');
  });

  test('navigation links have correct href attributes', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Booking').closest('a')).toHaveAttribute('href', '/booking');
    expect(screen.getByText('View').closest('a')).toHaveAttribute('href', '/view');
  });

  test('navbar toggle button is present for mobile', () => {
    render(
      <HeaderWrapper>
        <Header onUserIconClick={mockOnUserIconClick} />
      </HeaderWrapper>
    );

    const toggleButton = document.querySelector('.navbar-toggler');
    expect(toggleButton).toBeInTheDocument();
  });
});