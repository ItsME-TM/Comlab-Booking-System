import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../components/notification.css';
import Profile from '../components/Profile';

// Simulated axios until backend is connected
const axios = {
  get: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let sampleUsers = [
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
            isRead: true
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
            isRead: false
          },
          {
            reciverEmail: 'user4@example.com',
            type: 'reminder',
            senderEmail: 'admin@example.com',
            labSessionTitle: 'Lab Session 4',
            labDate: new Date('2024-06-25'),
            labStartTime: '03:00 PM',
            labEndTime: '05:00 PM',
            message: 'Reminder: Your lab session is approaching.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-20'),
            IsLabWillGoingOn: false,
            isRead: false
          },
          {
            reciverEmail: 'user5@example.com',
            type: 'booking_confirmation',
            senderEmail: 'staff@example.com',
            labSessionTitle: 'Lab Session 5',
            labDate: new Date('2024-06-28'),
            labStartTime: '01:00 PM',
            labEndTime: '03:00 PM',
            message: 'Your lab session has been confirmed.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-23'),
            IsLabWillGoingOn: false,
            isRead: false
          },
        ];
        resolve({ data: sampleUsers });
      }, 1000); // Simulating delay for API call
    });
  },
  delete: (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000); // Simulating delay for API call
    });
  },
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [labDetails, setLabDetails] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showOkButton, setShowOkButton] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await axios.get('/users');
      setNotifications(response.data);
      setFilteredNotifications(response.data); // Initially show all notifications
    };
    fetchNotifications();
  }, []);

  /*useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming you store JWT in localStorage
          },
        });
        setNotifications(response.data);
        setFilteredNotifications(response.data); // Initially show all notifications
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);*/

  useEffect(() => {
    if (selectedType) {
      if (selectedType === 'unread') {
        setFilteredNotifications(notifications.filter(notification => !notification.isRead));
      } else {
        setFilteredNotifications(notifications.filter(notification => notification.type === selectedType));
      }
    } else {
      setFilteredNotifications(notifications);
    }
  }, [selectedType, notifications]);

  const handleButtonClick = (type) => {
    setSelectedType(type);
    setLabDetails(null);
    setSelectedNotification(null);
    setShowOkButton(false);
  };

  const handleNotificationClick = (notification) => {
    setLabDetails(notification);
    setSelectedNotification(notification);
    setIsDialogVisible(true);
  };

  const handleOkClick = () => {
    setLabDetails(null);
    setSelectedNotification(null);
    setShowOkButton(false);
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  return (
    <div>
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className="notification-container">
        {/* Left side with toolbars */}
        <div className="left-side">
          <h2 className='title'>Notifications</h2>
          <ul className='toolbars'>
            <button className="toolbar-button" onClick={() => handleButtonClick('')}>All</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('unread')}>Unread</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('request')}>Requests</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('cancellation')}>Cancellations</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('reminder')}>Reminders</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('booking_confirmation')}>Booking Confirmations</button>
          </ul>
        </div>
        {/* Right side with preview */}
        <div className="right-side">
          {/* Display preview content here */}
          <div className="scroll-container">
            <ul className="preview-list">
              {filteredNotifications.map((notification, index) => (
                <li
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className={notification === selectedNotification ? 'selected' : ''}
                >
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
          {isDialogVisible && labDetails && (
            <div className="dialog-box">
              <div className="dialog-content">
                {selectedType === 'unread' && (
                  <>
                    <h2>{labDetails.labSessionTitle}</h2>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleOkClick} className="ok-button">
                      OK
                    </button>
                  </>
                )}
                {selectedType === 'request' && (
                  <>
                    <h2>Lab Session Request</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>Lab Session: {labDetails.labSessionTitle}</p>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleAcceptClick} className="ok-button">
                      Accept
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {isBoxVisible && <Profile />}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import '../components/notification.css';
import Profile from '../components/Profile';

// Simulated axios until backend is connected
const axios = {
  get: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let sampleUsers = [
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
            isRead: true
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
            isRead: false
          },
          {
            reciverEmail: 'user4@example.com',
            type: 'reminder',
            senderEmail: 'admin@example.com',
            labSessionTitle: 'Lab Session 4',
            labDate: new Date('2024-06-25'),
            labStartTime: '03:00 PM',
            labEndTime: '05:00 PM',
            message: 'Reminder: Your lab session is approaching.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-20'),
            IsLabWillGoingOn: false,
            isRead: false
          },
          {
            reciverEmail: 'user5@example.com',
            type: 'booking_confirmation',
            senderEmail: 'staff@example.com',
            labSessionTitle: 'Lab Session 5',
            labDate: new Date('2024-06-28'),
            labStartTime: '01:00 PM',
            labEndTime: '03:00 PM',
            message: 'Your lab session has been confirmed.',
            isReciverConfirm: false,
            createdAt: new Date('2024-06-23'),
            IsLabWillGoingOn: false,
            isRead: false
          },
        ];
        resolve({ data: sampleUsers });
      }, 1000); // Simulating delay for API call
    });
  },
  put: (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000); // Simulating delay for API call
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
      try {
        const response = await axios.get('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setNotifications(response.data);
        setFilteredNotifications(response.data); 
        console.log('Fetched notifications:', response.data);
        // Update state or perform actions with fetched notifications
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Handle error, show error message to the user
      }
      
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedType) {
      if (selectedType === 'unread') {
        setFilteredNotifications(notifications.filter(notification => !notification.isRead));
      }else if (selectedType === 'reminder') {
        const now = new Date();
        const nearbyReminders = notifications.filter(notification => {
          const labStartTime = new Date(notification.labDate);
          const timeDiff = labStartTime.getTime() - now.getTime();
          const minutesDiff = Math.floor(timeDiff / (1000 * 60));
          return (
            labStartTime.toDateString() === now.toDateString() && minutesDiff <= 30 && minutesDiff >= 0
          );
        });
        setFilteredNotifications(nearbyReminders);
      } else {
        setFilteredNotifications(notifications.filter(notification => notification.type === selectedType));
      }
    } else {
      setFilteredNotifications(notifications);
    }
  }, [selectedType, notifications]);

  const handleButtonClick = (type) => {
    setSelectedType(type);
    setLabDetails(null);
    setSelectedNotification(null);
    setIsDialogVisible(false);
  };

  const handleNotificationClick = (notification) => {
    setLabDetails(notification);
    setSelectedNotification(notification);
    setIsDialogVisible(true);
  };

  const handleOkClick = async () => {
    if (selectedNotification.type === 'unread') {
      try {
        const response = await axios.put(`/api/notifications/markRead/${notificationId}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Marked notification as read:', response.data);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
      try {
  const response = await axios.get('/api/notifications', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  setNotifications(response.data);
  console.log('Fetched notifications:', response.data);
  // Update state or perform actions with fetched notifications
} catch (error) {
  console.error('Error fetching notifications:', error);
  // Handle error, show error message to the user
}

    } else {
      setIsDialogVisible(false);
    }
  };

  const handleAcceptClick = async () => {

    try {
      const response = await axios.post(`/api/notifications/updateIsLabStatus/${notificationId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Updated IsLabWillGoingOn:', response.data);
    } catch (error) {
      console.error('Error updating IsLabWillGoingOn:', error);
    }
    
    try {
      const response = await axios.post(`/api/notifications/updateNotificationType/${notificationId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Updated notification type:', response.data);
    } catch (error) {
      console.error('Error updating notification type:', error);
    }
    
    console.log("Accept button clicked for request notification.");
    setIsDialogVisible(false);
  };
  const handleReadClick = async () => {
    setIsDialogVisible(false);
  };
  const handleCancelClick = async () => {
    setIsDialogVisible(false);
  };
  const handlConClick = async () => {
    setIsDialogVisible(false);
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  return (
    <div>
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className="notification-container">
        {/* Left side with toolbars */}
        <div className="left-side">
          <h2 className='title'>Notifications</h2>
          <ul className='toolbars'>
            <button className="toolbar-button" onClick={() => handleButtonClick('')}>All</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('unread')}>Unread</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('request')}>Requests</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('cancellation')}>Cancellations</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('reminder')}>Reminders</button>
            <button className="toolbar-button" onClick={() => handleButtonClick('booking_confirmation')}>Booking Confirmations</button>
          </ul>
        </div>
        {/* Right side with preview */}
        <div className="right-side">
          {/* Display preview content here */}
          <div className="scroll-container">
            <ul className="preview-list">
              {filteredNotifications.map((notification, index) => (
                <li
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className={notification === selectedNotification ? 'selected' : ''}
                >
                  {notification.message}
                </li>
              ))}
            </ul>
          </div>
          {isDialogVisible && labDetails && (
            <div className="lab-details-box">
              <div className="lab-details">
                {selectedNotification.type === 'unread' && (
                  <>
                    <h2>{labDetails.labSessionTitle}</h2>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleReadClick} className="ok-button">
                      OK
                    </button>
                  </>
                )}
                {selectedNotification.type === 'request' && (
                  <>
                    <h2>Lab Session Request</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>Lab Session: {labDetails.labSessionTitle}</p>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleAcceptClick} className="ok-button">
                      Accept
                    </button>
                  </>
                )}
                {selectedNotification.type === 'cancellation' && (
                  <>
                    <h2>Lab Session Cancellation</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>Lab Session: {labDetails.labSessionTitle}</p>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleCancelClick} className="ok-button">
                      OK
                    </button>
                  </>
                )}
                {selectedType === 'reminder' && (
                  <>
                    <h2>Reminder</h2>
                    <p>{labDetails.labSessionTitle}</p>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    {/* Calculate remaining time */}
                    <p>Remaining Time: {calculateRemainingTime(labDetails.labDate, labDetails.labStartTime)}</p>
                    <button onClick={handlConClick} className="ok-button">
                      OK
                    </button>
                  </>
                )}
                {selectedNotification.type === 'booking_confirmation' && (
                  <>
                    <h2>Booking Confirmation</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>Lab Session: {labDetails.labSessionTitle}</p>
                    <p>Date: {new Date(labDetails.labDate).toDateString()}</p>
                    <p>Time: {labDetails.labStartTime} - {labDetails.labEndTime}</p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handlConClick} className="ok-button">
                      OK
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        {isBoxVisible && <Profile />}
      </div>
    </div>
  );
}

function calculateRemainingTime(labDate, labStartTime) {
  const now = new Date();
  const sessionStartTime = new Date(labDate + ' ' + labStartTime);
  const timeDiff = sessionStartTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  return minutesDiff;
}