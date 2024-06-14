import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import axios from 'axios';
import '../components/View.css'; // Import your CSS file
import Header from '../components/Header';
import Profile from '../components/Profile';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [isCancelConfirmationVisible, setIsCancelConfirmationVisible] = useState(false);
  const [attendeesInput, setAttendeesInput] = useState('');
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEvents(response.data.map(booking => ({
          id: booking._id, // Add booking ID for deletion
          title: booking.title,
          start: new Date(booking.startTime),
          end: new Date(booking.endTime),
          description: booking.description,
          attendees: booking.attendees // Assuming attendees is an array of strings
        })));
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = () => {
    navigate('/booking', { state: { event: selectedEvent } });
  };

  const handleCancelEvent = async () => {
    if (!selectedEvent) {
      return;
    }

    setIsCancelConfirmationVisible(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/bookings/${selectedEvent.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove the selected event from the events array
      const updatedEvents = events.filter((event) => event.id !== selectedEvent.id);
      setEvents(updatedEvents);
      setSelectedEvent(null); // Clear the selectedEvent state
    } catch (error) {
      console.error('Error deleting booking:', error);
    }

    setIsCancelConfirmationVisible(false);
  };

  const handleCancelCancel = () => {
    setIsCancelConfirmationVisible(false);
  };

  const handleInviteAttendees = () => {
    if (!selectedEvent || !attendeesInput) {
      return;
    }

    // Assuming attendees are stored as an array in the event object
    const updatedEvent = {
      ...selectedEvent,
      attendees: [...selectedEvent.attendees, attendeesInput]
    };

    // Update the events array with the new attendee
    const updatedEvents = events.map(event => event.id === selectedEvent.id ? updatedEvent : event);
    setEvents(updatedEvents);

    // Clear the input field
    setAttendeesInput('');
  };

  const CustomToolbar = () => {
    return (
      <div className="rbc-toolbar" style={{ backgroundColor: '#A6BBC1', padding: '10px' }}>
        <div style={{ color: '#638793', display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <div style={{ marginLeft: '20px' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ backgroundColor: '#638793', width: '120px', height: '50px', marginRight: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' }}>
                {moment().format('MMMM')} {moment().format('YYYY')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const handleClickOutside = (event) => {
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
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className='view_body'>
        <div style={{ padding: '50px' }}>
          <div style={{backgroundColor:'white'}}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '600px' }}
              eventPropGetter={(event, start, end, isSelected) => ({
                style: {
                  backgroundColor: '#00B528', // Green color
                },
              })}
              onSelectEvent={handleSelectEvent}
              components={{
                toolbar: CustomToolbar,
              }}
            />
          </div>
          {selectedEvent && (
            <div className="event-details">
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.description}</p>
              <p>Start: {selectedEvent.start.toLocaleString()}</p>
              <p>End: {selectedEvent.end.toLocaleString()}</p>
              <p>Attendees:</p>
              <ul>
  {selectedEvent.attendees.map((attendee, index) => (
    <li key={index} style={{ color: 'white' }}>{attendee}</li>
  ))}
</ul>

              <div className="button-group">
                <button onClick={handleEditEvent}>Edit</button>
                <button onClick={handleCancelEvent}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        {isCancelConfirmationVisible && (
          <div className="confirmation-box">
            <h2>Cancel scheduled lab session?</h2>
            <p>You will permanently cancel this scheduled lab session</p>
            <div className="button-group">
              <button className="not-now-button" onClick={handleCancelCancel}>Not now</button>
              <button className="cancel-button" onClick={handleConfirmCancel}>Cancel lab session</button>
            </div>
          </div>
        )}

        {isBoxVisible && <Profile profileRef={profileRef}/>}
      </div>
    </div>
  );
}

export default CalendarView;
