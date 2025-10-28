import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/booking.css';
import Header from '../components/Header';
import axios from 'axios';
import Profile from '../components/Profile';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import Select from 'react-select';

function MyApp() {
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isPollVisible, setIsPollVisible] = useState(false);
  const [pollDate, setPollDate] = useState('');
  const [uEmail, setEmail] = useState('');
  const [id, setId] = useState(''); // Added state for id
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setEmail(decodedToken.email || '');
    }
  }, [token]);

  useEffect(() => {
    if (location.state && location.state.event) {
      const { event } = location.state;
      setId(event.id);
      setTitle(event.title);
      setSelectedDate(moment(event.start).format('YYYY-MM-DD'));
      setStartTime(moment(event.start).format('HH:mm'));
      setEndTime(moment(event.end).format('HH:mm'));
      setDescription(event.description);
      setAttendees(event.attendees || []);
      setEmail(event.uEmail || '');
    }
  }, [location.state]);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`/api/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const user = response.data;
          setEmail(user.email);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUser();
    }
  }, [id, token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/getNames', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        console.log('users from booking page:', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [token]);

  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDateChange = event => {
    const inputDate = event.target.value;
    setSelectedDate(inputDate);
    setFormattedDate(formatDate(inputDate));
  };

  const handleCheckButton = async () => {
    if (!startTime || !endTime) {
      setAvailabilityMessage('Start time and end time cannot be empty');
      return;
    }
    console.log('aaaaaaaaaa');
    const checkData = {
      startTime: new Date(`${selectedDate}T${startTime}`).toISOString(),
      endTime: new Date(`${selectedDate}T${endTime}`).toISOString(),
    };

    console.log('Checking availability with data:', checkData);

    try {
      const response = await axios.post(
        '/api/bookings/check-availability',
        checkData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Availability check response:', response.data);
      setAvailabilityMessage(response.data.message);
    } catch (error) {
      console.error('Availability check error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setAvailabilityMessage(error.response.data.error);
      } else {
        setAvailabilityMessage('Server error');
      }
    }
  };

  const handleSave = async () => {
    const bookingData = {
      title,
      startTime: new Date(`${selectedDate}T${startTime}`).toISOString(),
      endTime: new Date(`${selectedDate}T${endTime}`).toISOString(),
      description,
      attendees: attendees.map(user => user.email),
    };

    console.log('Saving booking with data:', bookingData);
    try {
      // If there's an existing event in the location state, edit the lab session
      if (location.state && location.state.event) {
        const bookingId = location.state.event.id;
        const response = await axios.put(
          `/api/bookings/editLabSession/${bookingId}`,
          bookingData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log('Edit lab session response:', response.data);
        alert('Lab session updated successfully');
        window.history.replaceState(null, '');
        window.location.reload();
      } else {
        // Otherwise, create a new booking
        const response = await axios.post('/api/bookings', bookingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Booking save response:', response.data);
        alert('Booking Successful');
        //window.location.reload();

        const bookingId = response.data._id;
        console.log('aaaaaaaaaabbbbbbbbb', bookingId);
        const notificationData = {
          title: bookingData.title,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          description: bookingData.description,
          attendees: bookingData.attendees,
          uEmail: uEmail,
          uDate: new Date(`${selectedDate}`).toISOString(),
          bookingId,
        };

        console.log('Saving notification with data:', notificationData);

        try {
          const notificationResponse = await axios.post(
            '/api/notification/createNotification',
            notificationData,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log(
            'Notification creation response:',
            notificationResponse.data,
          );
        } catch (notificationError) {
          console.error('Notification creation error:', notificationError);
          if (
            notificationError.response &&
            notificationError.response.data &&
            notificationError.response.data.message
          ) {
            setErrorMessage(notificationError.response.data.message);
          } else {
            setErrorMessage('Failed to create notification');
          }
        }
      }
    } catch (error) {
      console.error('Booking save error:', error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to save booking');
      }
    }
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

  const handleAttendeesChange = selectedOptions => {
    if (selectedOptions.length > 2) {
      selectedOptions = selectedOptions.slice(0, 2);
    }
    setAttendees(selectedOptions);
  };

  const handlePollButtonClick = () => {
    setIsPollVisible(true);
  };

  const handleClosePollClick = () => {
    setIsPollVisible(false);
  };

  const rectangleClass =
    availabilityMessage === 'Time slot is available' ||
    availabilityMessage === ''
      ? 'green-rectangle'
      : 'red-rectangle';

  return (
    <div className='bbb'>
      <Header
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <div className='my-app'>
        <div className='booking-body'>
          <div className='left'>
            <h1>Book Lab Session</h1>
            <div className='form-group'>
              <label htmlFor='title'>Add Title:</label>
              <input
                type='text'
                id='title'
                name='title'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <label htmlFor='attendees'>Invite Attendees:</label>
              <Select
                isMulti
                value={attendees}
                onChange={handleAttendeesChange}
                options={users.map(user => ({
                  value: user._id,
                  label: `${user.firstName} ${user.lastName}: ${user.email}`,
                  email: user.email,
                }))}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={true}
                maxMenuHeight={450}
              />

              <label htmlFor='date'>Date:</label>
              <div className='inline-container'>
                <input
                  type='date'
                  id='date'
                  name='date'
                  style={{ width: '150px' }}
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]} // Block past dates
                />
                <label htmlFor='startTime'>From:</label>
                <input
                  type='time'
                  id='startTime'
                  name='startTime'
                  style={{ width: '90px' }}
                  onChange={e => setStartTime(e.target.value)}
                />
                <label htmlFor='endTime'>To:</label>
                <input
                  type='time'
                  id='endTime'
                  name='endTime'
                  style={{ width: '90px' }}
                  onChange={e => setEndTime(e.target.value)}
                />
                <button className='check-button' onClick={handleCheckButton}>
                  Check
                </button>
              </div>

              <label htmlFor='description'>Description (Optional):</label>
              <textarea
                id='description'
                name='description'
                rows='2'
                cols='30'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Short Description'
              />
              <div className='button-container'>
                <button className='check-button' onClick={handleSave}>
                  {location.state && location.state.event ? 'Save' : 'Book'}
                </button>
                <button
                  className='check-button'
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
              </div>
              {errorMessage && <p className='error-message'>{errorMessage}</p>}
            </div>
          </div>

          <div className='right'>
            <div className={`container-11 ${isPollVisible ? 'hidden' : ''}`}>
              <h3>CO1 Lab Availability</h3>
              <div className={rectangleClass}>
                <div>{formattedDate}</div>
                <div>
                  {startTime} - {endTime}
                </div>
                <div>
                  <br />
                  {availabilityMessage && (
                    <p className='availability-message'>
                      {availabilityMessage}
                    </p>
                  )}{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isBoxVisible && <Profile profileRef={profileRef} />}
    </div>
  );
}

export { MyApp as LabBooking };
export default MyApp;
