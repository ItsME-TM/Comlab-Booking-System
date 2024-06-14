import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/booking.css';
import Header from '../components/Header';
import axios from 'axios';
import moment from 'moment';

export default function MyApp() {
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('token'); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.event) {
      const { event } = location.state;
      setTitle(event.title);
      setSelectedDate(moment(event.start).format('YYYY-MM-DD'));
      setStartTime(moment(event.start).format('HH:mm'));
      setEndTime(moment(event.end).format('HH:mm'));
      setDescription(event.description);
      // Assuming attendees are stored in the event object, adjust as necessary
      setAttendees(event.attendees || []);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users/getNames', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
        console.log('users from booking page:', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [token]);

  const handleDateChange = (event) => {
    const inputDate = event.target.value;
    setSelectedDate(inputDate);
  };

  const handleCheckButton = async () => {
    if (!startTime || !endTime) {
      setAvailabilityMessage('Start time and end time cannot be empty');
      return;
    }

    const checkData = {
      startTime: new Date(`${selectedDate}T${startTime}`).toISOString(),
      endTime: new Date(`${selectedDate}T${endTime}`).toISOString()
    };

    console.log('Checking availability with data:', checkData);

    try {
      const response = await axios.post('/api/bookings/check-availability', checkData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
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
      attendees: attendees.map(user => user.email) // Using the selected attendees' emails
    };
  
    console.log('Saving booking with data:', bookingData);
  
    try {
      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Delete the earlier lab booking if it exists
      if (location.state && location.state.event) {
        await axios.delete(`/api/bookings/${location.state.event.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
  
      console.log('Booking save response:', response.data);
      alert('Booking Successful');
      window.location.reload();
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Server error');
      }
    }
  };
  
  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleAttendeesChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions);
    setAttendees(selectedOptions.map(option => JSON.parse(option.value)));
  };

  return (
    <div>
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className="my-app">
        <div className="booking-body">
            <div className="right">
              <div className="container-11">
                <h3>CO1 Lab Availability</h3>
                <div className="green-rectangle">
                  {selectedDate}
                </div>
                {availabilityMessage && <p className="availability-message">{availabilityMessage}</p>}
              </div>
            </div>
          <div className="left">
            <h1>{location.state && location.state.event ? 'Edit Booking' : 'Book Lab Session'}</h1>
            <div className="form-group">
              <label htmlFor="title">Add Title:</label>
              <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />

              <label htmlFor="attendees">Invite Attendees:</label>
              <select multiple id="attendees" name="attendees" onChange={handleAttendeesChange}>
                {users.map(user => (
                  <option key={user._id} value={JSON.stringify(user)}>{`${user.firstName} ${user.lastName}: ${user.email}`}</option>
                ))}
              </select>

              <label htmlFor="date">Date:</label>
              <div className="inline-container">
                <input type="date" id="date" name="date" style={{ width: '150px' }} value={selectedDate} onChange={handleDateChange} />
                <label htmlFor="startTime">From:</label>
                <input type="time" id="startTime" name="startTime" style={{ width: '90px' }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <label htmlFor="endTime">To:</label>
                <input type="time" id="endTime" name="endTime" style={{ width: '90px' }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <button className="check-button" onClick={handleCheckButton}>Check</button>
              </div>

              <label htmlFor="description">Description (Optional):</label>
              <textarea id="description" name="description" rows="2" cols="30" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short Description" />
              <div className="button-container">
                <button className="check-button" onClick={handleSave} type="submit">Save</button>
                <button className="check-button" onClick={() => navigate('/dashboard')}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}
