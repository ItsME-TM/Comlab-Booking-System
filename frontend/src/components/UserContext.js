import React, { createContext, useState } from 'react';

// Create a context for user data
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    firstName: 'shashika',
    lastName: 'Rathnayake',
    email: 'shashika@eng.jfn.ac.lk',
    password: 'password123',
    role: 'admin',
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};
