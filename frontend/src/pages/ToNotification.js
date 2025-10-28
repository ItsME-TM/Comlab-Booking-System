import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import ToHeader from '../components/ToHeder';
import '../components/notification.css';
import Profile from '../components/Profile';
import BeatLoader from 'react-spinners/BeatLoader';

export default function ToNotification() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState(
    localStorage.getItem('selectedType') || '',
  );
  const [labDetails, setLabDetails] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const profileRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response1 = await axios.get('/api/notification/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(response1.data);
        setFilteredNotifications(response1.data);
        console.log('Fetched combined notifications:', response1.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    const updateNotificationsToReminder = async () => {
      try {
        const response = await axios.put(
          '/api/notification/reminder',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log('Notifications updated:', response.data);
      } catch (error) {
        console.error('Error updating notifications:', error);
      }
    };
    updateNotificationsToReminder();
  }, [token]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const filterNotifications = useCallback(
    type => {
      if (type === 'unread') {
        setFilteredNotifications(
          notifications.filter(notification => !notification.isRead),
        );
      } else if (type === '') {
        setFilteredNotifications(notifications);
      } else if (type === 'Confirmed/Rejected') {
        setFilteredNotifications(
          notifications.filter(
            notification =>
              notification.type === 'rejected' ||
              notification.type === 'confirmed',
          ),
        );
      } else {
        setFilteredNotifications(
          notifications.filter(notification => notification.type === type),
        );
      }
    },
    [notifications],
  );

  useEffect(() => {
    filterNotifications(selectedType);
  }, [selectedType, notifications, filterNotifications]);

  const handleButtonClick = type => {
    setSelectedType(type);
    localStorage.setItem('selectedType', type);
    setLabDetails(null);
    setSelectedNotification(null);
    setIsDialogVisible(false);
  };

  const handleNotificationClick = notification => {
    setLabDetails(notification);
    setSelectedNotification(notification);
    setIsDialogVisible(true);
    setIsBoxVisible(false);
  };

  const handleOkClick = async () => {
    if (!selectedNotification) {
      console.error('No selected notification');
      return;
    }

    try {
      const response = await axios.put(
        `/api/notification/markRead/${selectedNotification._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id
          ? { ...notif, isRead: true }
          : notif,
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setIsDialogVisible(false);
    window.location.reload(); // Refresh the page
  };

  const handleAcceptClick = async () => {
    try {
      const response = await axios.post(
        `/api/notification/updateIsReceiverConfirm/${selectedNotification._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(
        'Updated isReceiverConfirm and booking status:',
        response.data,
      );
    } catch (error) {
      console.error(
        'Error updating isReceiverConfirm and booking status:',
        error,
      );
    }
    setIsDialogVisible(false);
    window.location.reload(); // Refresh the page
  };

  const handleCancelClick = async () => {
    try {
      const response = await axios.put(
        `/api/notification/markRead/${selectedNotification._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id
          ? { ...notif, isRead: true }
          : notif,
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setIsDialogVisible(false);
    window.location.reload(); // Refresh the page
  };

  const handleConClick = async () => {
    try {
      const response = await axios.put(
        `/api/notification/markRead/${selectedNotification._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id
          ? { ...notif, isRead: true }
          : notif,
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    setIsDialogVisible(false);
    window.location.reload(); // Refresh the page
  };

  const handleRejectClick = async () => {
    try {
      const response = await axios.post(
        `/api/notification/reject/${selectedNotification._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('Updated notification type:', response.data);
    } catch (error) {
      console.error('Error updating notification type:', error);
    }
    setIsDialogVisible(false);
    window.location.reload(); // Refresh the page
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleClickOutside = event => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsBoxVisible(false);
    }
  };

  useEffect(() => {
    if (isBoxVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBoxVisible]);

  return (
    <div>
      <ToHeader
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <div className='notification-container'>
        <div className='left-side'>
          <h2 className='title'>Notifications</h2>
          <ul className='toolbars'>
            <button
              className={`toolbar-button ${selectedType === '' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('')}
            >
              All
            </button>
            <button
              className={`toolbar-button ${selectedType === 'unread' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('unread')}
            >
              Unread
            </button>
            <button
              className={`toolbar-button ${selectedType === 'request' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('request')}
            >
              Requests
            </button>
            <button
              className={`toolbar-button ${selectedType === 'cancellation' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('cancellation')}
            >
              Cancellations
            </button>
            <button
              className={`toolbar-button ${selectedType === 'reminder' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('reminder')}
            >
              Reminders
            </button>
            <button
              className={`toolbar-button ${selectedType === 'Confirmed/Rejected' ? 'selected' : ''}`}
              onClick={() => handleButtonClick('Confirmed/Rejected')}
            >
              Confirmed/Rejected
            </button>
          </ul>
        </div>
        <div className='right-side'>
          {loading ? (
            <div className='loading-spinner'>
              <BeatLoader color={'#000000'} loading={true} size={20} />
            </div>
          ) : (
            <div className='scroll-container'>
              <ul className='preview-list'>
                {filteredNotifications.map((notification, index) => (
                  <li
                    key={index}
                    onClick={() => handleNotificationClick(notification)}
                    className={`${notification === selectedNotification ? 'selected' : ''} ${isDialogVisible ? 'disabled' : ''}`}
                  >
                    {notification.type}_{notification.labSessionTitle}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isDialogVisible && labDetails && (
            <div className='lab-details-box'>
              <div className='lab-details'>
                {selectedNotification.type === 'unread' && (
                  <div className='dialog-box-noti'>
                    <button
                      className='close-button'
                      onClick={() => {
                        handleCancelClick();
                        window.location.reload();
                      }}
                    >
                      x
                    </button>
                    <h2>{labDetails.type}</h2>
                    <p>
                      {labDetails.labSessionTitle}
                      <br />
                      {new Date(labDetails.labDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        },
                      )}{' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                      {' - '}
                      {new Date(labDetails.labEndTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                    </p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleOkClick} className='ok-button'>
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'request' && (
                  <div className='dialog-box-noti'>
                    <button
                      className='close-button'
                      onClick={() => {
                        handleCancelClick();
                        window.location.reload();
                      }}
                    >
                      x
                    </button>
                    <h2>Lab Session Request</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>
                      {labDetails.labSessionTitle}
                      <br />
                      {new Date(labDetails.labDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        },
                      )}{' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                      {' - '}
                      {new Date(labDetails.labEndTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                    </p>
                    <p>
                      <b>
                        You have a pending lab session booking request for the
                        above details.
                      </b>
                    </p>
                    <div className='button-group'>
                      <button onClick={handleAcceptClick} className='ok-button'>
                        {' '}
                        Accept{' '}
                      </button>
                      <button onClick={handleRejectClick} className='ok-button'>
                        {' '}
                        Reject{' '}
                      </button>
                    </div>
                  </div>
                )}
                {selectedNotification.type === 'cancellation' && (
                  <div className='dialog-box-noti'>
                    <button
                      className='close-button'
                      onClick={() => {
                        handleCancelClick();
                        window.location.reload();
                      }}
                    >
                      x
                    </button>
                    <h2>Lab Cancellation</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>
                      {labDetails.labSessionTitle}
                      <br />
                      {new Date(labDetails.labDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        },
                      )}{' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                      {' - '}
                      {new Date(labDetails.labEndTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                    </p>
                    <p>
                      <b>Above mentioned lab session was cancelled.</b>
                    </p>
                    <button onClick={handleCancelClick} className='ok-button'>
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'reminder' && (
                  <div className='dialog-box-noti'>
                    <button
                      className='close-button'
                      onClick={() => {
                        handleCancelClick();
                        window.location.reload();
                      }}
                    >
                      x
                    </button>
                    <h2>Reminder</h2>
                    <p>
                      {labDetails.labSessionTitle}
                      <br />
                      {new Date(labDetails.labDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        },
                      )}{' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                      {' - '}
                      {new Date(labDetails.labEndTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                    </p>
                    <p>
                      <b>
                        {calculateRemainingTime(
                          labDetails.labDate,
                          labDetails.labStartTime,
                        )}{' '}
                        minutes left for the lab session to start.
                      </b>
                    </p>
                    <button onClick={handleConClick} className='ok-button'>
                      OK
                    </button>
                  </div>
                )}
                {(selectedNotification.type === 'confirmed' ||
                  selectedNotification.type === 'rejected') && (
                  <div className='dialog-box-noti'>
                    <button
                      className='close-button'
                      onClick={() => {
                        handleCancelClick();
                        window.location.reload();
                      }}
                    >
                      x
                    </button>
                    <h2>{labDetails.type}</h2>
                    <p>
                      {labDetails.labSessionTitle}
                      <br />
                      {new Date(labDetails.labDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'short',
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        },
                      )}{' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                      {' - '}
                      {new Date(labDetails.labEndTime).toLocaleTimeString(
                        'en-US',
                        { hour: '2-digit', minute: '2-digit', hour12: true },
                      )}
                    </p>
                    <p>
                      <b>The lab session has been {labDetails.type}.</b>
                    </p>
                    <button onClick={handleCancelClick} className='ok-button'>
                      OK
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {isBoxVisible && <Profile ref={profileRef} />}
    </div>
  );
}

function calculateRemainingTime(labDate, labStartTime) {
  const now = new Date();
  const sessionStartTime = new Date(`${labDate} ${labStartTime}`);
  const timeDiff = sessionStartTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  return minutesDiff;
}
