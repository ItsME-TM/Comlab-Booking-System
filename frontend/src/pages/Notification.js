import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import '../components/notification.css';
import Profile from '../components/Profile';
import { jwtDecode } from 'jwt-decode';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [labDetails, setLabDetails] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [isCancelConfirmationLaterVisible, setIsCancelConfirmLaterVisible] = useState(false);
  const [uEmail, setEmail] = useState("");
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setEmail(decodedToken.email || ""); 
    }
  }, [token]);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response1 = await axios.get('/api/notification/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const response2 = await axios.get(`/api/notification/userReciver/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const combinedData = [...response1.data, ...response2.data];
  
        setNotifications(combinedData);
        setFilteredNotifications(combinedData);
        console.log('Fetched combined notifications:', combinedData);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, [token]);

  const filterNotifications = useCallback((type) => {
    if (type === 'unread') {
      setFilteredNotifications(notifications.filter(notification => !notification.isRead));
    } else if (type === 'reminder') {
      const now = new Date();
      const nearbyReminders = notifications.filter(notification => {
        const labStartTime = new Date(notification.labDate);
        const timeDiff = labStartTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        return (labStartTime.toDateString() === now.toDateString() && minutesDiff <= 30 && minutesDiff >= 0);
      });
      setFilteredNotifications(nearbyReminders);
    } else if (type === '') {
      setFilteredNotifications(notifications);
    } else if (type === 'booking_confirmation') {
      // Filter both 'booking_confirmation' and 'reject' types
      setFilteredNotifications(notifications.filter(notification => 
        notification.type === 'booking_confirmation' || notification.type === 'rejected' || notification.type === 'confirmed'
      ));
    }  else {
      setFilteredNotifications(notifications.filter(notification => notification.type === type));
    }
  }, [notifications]);

  useEffect(() => {
    filterNotifications(selectedType);
  }, [selectedType, notifications, filterNotifications]);

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
    console.log('handleOKClick called');

    if (!selectedNotification) {
      console.error('No selected notification');
      return;
    }

    try {
      const response = await axios.put(`/api/notification/markRead/${selectedNotification._id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id ? { ...notif, isRead: true } : notif
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setIsDialogVisible(false);
  };

  const handleAcceptClick = async () => {
    try {
      const response = await axios.post(
        `/api/notification/updateIsReceiverConfirm/${selectedNotification._id}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Updated isReceiverConfirm and booking status:', response.data);
    } catch (error) {
      console.error('Error updating isReceiverConfirm and booking status:', error);
    }
    setIsDialogVisible(false);
  };

  const handleCancelClick = async () => {

    try {
      const response = await axios.put(`/api/notification/markRead/${selectedNotification._id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id ? { ...notif, isRead: true } : notif
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setIsDialogVisible(false);
  };

  const handleConClick = async () => {

    try {
      const response = await axios.put(`/api/notification/markRead/${selectedNotification._id}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Marked notification as read:', response.data);

      const updatedNotifications = notifications.map(notif =>
        notif._id === selectedNotification._id ? { ...notif, isRead: true } : notif
      );
      setNotifications(updatedNotifications);
      setFilteredNotifications(updatedNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    setIsDialogVisible(false);
  };

  const handleRejectClick = async () => {
    try {
      const response = await axios.post(`/api/notification/reject/${selectedNotification._id}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Updated notification type:', response.data);
    } catch (error) {
      console.error('Error updating notification type:', error);
    }
    setIsDialogVisible(false);
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleConfirmationClick = async () => {
    setIsCancelConfirmLaterVisible(true);
  };

  const handleConfirmeLabClick = async () => {
    try {
      await axios.post(`/api/notification/confirmedLab/${selectedNotification._id}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('confirme lab session');
    } catch (error) {
      console.error('Error updating notification type:', error);
    }
    setIsDialogVisible(false);
  };

  const handleCancelLabClick = async () => {
    try {
      await axios.post(`/api/notification/updateIsLabStatus/${selectedNotification._id}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('Cancel lab session');
    } catch (error) {
      console.error('Error updating notification type:', error);
    }
    setIsDialogVisible(false);
  };

  return (
    <div>
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className="notification-container">
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
        <div className="right-side">
          <div className="scroll-container">
            <ul className="preview-list">
              {filteredNotifications.map((notification, index) => (
                <li
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className={notification === selectedNotification ? 'selected' : ''}
                >
                  {notification.type}_{notification.labSessionTitle}
                </li>
              ))}
            </ul>
          </div>
          {isDialogVisible && labDetails && (
            <div className="lab-details-box">
              <div className="lab-details">
                {selectedNotification.type === 'unread' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>{labDetails.type}</h2>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p>Message: {labDetails.message}</p>
                    <button onClick={handleOkClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'request' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Lab Session Request</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>You have a pending lab session booking request for the above details.</b></p>
                    <div className="button-group">
                      <button onClick={handleAcceptClick} className="ok-button"> Accept </button>
                      <button onClick={handleRejectClick} className="ok-button"> Reject </button>
                    </div>
                  </div>
                )}
                
                {selectedNotification.type === 'cancellation' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Lab Cancellation</h2>
                    <p>From: {labDetails.senderEmail}</p>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>Above mentioned lab session was cancelled.</b></p>
                    <button onClick={handleCancelClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'reminder' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Reminder</h2>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>{calculateRemainingTime(labDetails.labDate, labDetails.labStartTime)} minutes left for the lab session to start.</b></p>
                    <button onClick={handleConClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'booking_confirmation' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Booking Confirmation</h2>
                    <p>Who Accepted: {labDetails.receiverEmail}</p>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>Your Request was accepted.</b></p>
                    <div className="button-group">
                      <button onClick={handleConfirmationClick} className="ok-button">OK</button>
                      <button onClick={handleRejectClick} className="ok-button"> Cancel lab </button>
                    </div>
                  </div>
                )}
                {isCancelConfirmationLaterVisible && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Cancel/Confirme lab session?</h2>
                    <p><br /> <br /> </p>
                    <button onClick={handleCancelLabClick} className="ok-button"> Cancel lab </button>
                    <button onClick={handleConfirmeLabClick} className="ok-button"> Confirme lab </button>
                    <button onClick={handleCancelClick} className="ok-button"> Later on </button>
                  </div>
                )}
                {selectedNotification.type === 'rejected' && labDetails.senderEmail === uEmail && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Rejection Notice</h2>
                    <p>rejected by: {labDetails.receiverEmail}</p>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>Your Request was rejected.</b></p>
                    <button onClick={handleCancelClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}

                {selectedNotification.type === 'rejected' && labDetails.receiverEmail === uEmail && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>Rejection Notice</h2>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>You have rejected the lab session.</b></p>
                    <button onClick={handleCancelClick} className="ok-button">
                      OK
                    </button>
                  </div>
                )}
                {selectedNotification.type === 'confirmed' && (
                  <div className="dialog-box-noti">
                    <button className="close-button" onClick={handleCancelClick}>x</button>
                    <h2>confirmed Notice</h2>
                    <p>{labDetails.labSessionTitle}<br />
                      {new Date(labDetails.labDate).toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit', year: 'numeric' })} 
                      {' '}
                      {new Date(labDetails.labStartTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} 
                      {' - '} 
                      {new Date(labDetails.labEndTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                    <p><b>The lab session has been confirmed.</b></p>
                    <button onClick={handleCancelClick} className="ok-button">
                      OK
                    </button>
                  </div>
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
  const sessionStartTime = new Date(`${labDate} ${labStartTime}`);
  const timeDiff = sessionStartTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / (1000 * 60));
  return minutesDiff;
}
