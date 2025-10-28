// NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notificationDetails, setNotificationDetails] = useState('');

  const handleButtonClick = details => {
    setNotificationDetails(details);
  };

  return (
    <NotificationContext.Provider
      value={{ notificationDetails, handleButtonClick }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
