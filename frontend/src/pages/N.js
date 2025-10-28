import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../components/notification.css';
import Profile from '../components/Profile';

// Simulated axios until backend is connected
const axios = {
  get: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        const sampleUsers = [
          {
            reciverEmail: 'user2@example.com',
            type: 'request',
            senderEmail: 'staff@example.com',
            labSessionTitle: 'Lab Session 2',
            labDate: new Date('2024-06-20'),
            labStartTime: '02:00 PM',
            labEndTime: '04:00 PM',
            message: 'You have a new lab session request.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-17'),
            IsLabWillGoingOn: false,
            isRead: true,
          },
          {
            reciverEmail: 'user3@example.com',
            type: 'cancellation',
            senderEmail: 'admin@example.com',
            labSessionTitle: 'Lab Session 3',
            labDate: new Date('2024-06-22'),
            labStartTime: '10:00 AM',
            labEndTime: '12:00 PM',
            message: 'Your lab session has been cancelled.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-18'),
            IsLabWillGoingOn: false,
            isRead: false,
          },
        ];
        resolve({ data: sampleUsers });
      }, 1000);
    });
  },
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [labDetails, setLabDetails] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await axios.get('/users');
      setNotifications(response.data);
      setFilteredNotifications(response.data);
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedType) {
      if (selectedType === 'all') {
        setFilteredNotifications(notifications);
      } else {
        setFilteredNotifications(
          notifications.filter(
            notification => notification.type === selectedType,
          ),
        );
      }
    } else {
      setFilteredNotifications(notifications);
    }
  }, [selectedType, notifications]);

  const handleNotificationClick = notification => {
    setLabDetails(notification);
    setSelectedNotification(notification);
    setIsDialogVisible(true);
  };

  const handleOkClick = () => {
    setIsDialogVisible(false);
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  return (
    <div>
      <Header
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <div className='notification-container'>
        <div className='left-side'>
          <h2 className='title'>Notifications</h2>
          <ul className='toolbars'>
            <button
              className='toolbar-button'
              onClick={() => setSelectedType('all')}
            >
              All
            </button>
            <button
              className='toolbar-button'
              onClick={() => setSelectedType('request')}
            >
              Requests
            </button>
            <button
              className='toolbar-button'
              onClick={() => setSelectedType('cancellation')}
            >
              Cancellations
            </button>
          </ul>
        </div>
        <div className='right-side'>
          <div className='scroll-container'>
            <ul className='preview-list'>
              {filteredNotifications.map((notification, index) => (
                <li
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className={
                    notification === selectedNotification ? 'selected' : ''
                  }
                >
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
          {isDialogVisible && labDetails && (
            <div className='dialog-box'>
              <div className='dialog-content'>
                <h2>{labDetails.labSessionTitle}</h2>
                <p>From: {labDetails.senderEmail}</p>
                <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                <p>
                  Time: {labDetails.labStartTime} - {labDetails.labEndTime}
                </p>
                <p>Message: {labDetails.message}</p>
                <button onClick={handleOkClick} className='ok-button'>
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
        {isBoxVisible && <Profile />}
      </div>
    </div>
  );
}
