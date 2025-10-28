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
  const [isCancelConfirmationVisible, setIsCancelConfirmationVisible] =
    useState(false);
  const [attendeesInput, setAttendeesInput] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date()); // Add state for current date
  const [attendeeTypes, setAttendeeTypes] = useState({});
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format('YYYY-MM'),
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(
          response.data.map(booking => ({
            id: booking._id, // Add booking ID for deletion
            title: booking.title,
            start: new Date(booking.startTime),
            end: new Date(booking.endTime),
            description: booking.description,
            attendees: booking.attendees, // Assuming attendees is an array of strings
          })),
        );
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [token]);

  const handleSelectEvent = async event => {
    setSelectedEvent(event);
    try {
      const response = await axios.get(
        `/api/notification/attendeesAndTypeByBookingId/${event.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const attendeeTypesData = response.data.reduce((acc, obj) => {
        const [email, type] = Object.entries(obj)[0];
        acc[email] = type;
        return acc;
      }, {});
      setAttendeeTypes(attendeeTypesData);
      console.log(attendeeTypesData);
    } catch (error) {
      console.error('Error fetching attendee types:', error);
    }
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
      const response = await axios.post(
        `/api/bookings/cancelLabSession/${selectedEvent.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Updated booking status:', response.data);
      const updatedEvents = events.filter(
        event => event.id !== selectedEvent.id,
      );
      setEvents(updatedEvents);
      setSelectedEvent(null); // Clear the selectedEvent state
    } catch (error) {
      console.error('Error updating booking status:', error);
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
      attendees: [...selectedEvent.attendees, attendeesInput],
    };

    // Update the events array with the new attendee
    const updatedEvents = events.map(event =>
      event.id === selectedEvent.id ? updatedEvent : event,
    );
    setEvents(updatedEvents);

    // Clear the input field
    setAttendeesInput('');
  };

  const handleMonthChange = e => {
    const selectedMonth = e.target.value;
    setSelectedMonth(selectedMonth);
    const newDate = moment(selectedMonth).toDate();
    setCurrentDate(newDate);
  };

  const CustomToolbar = () => {
    return (
      <div
        className='rbc-toolbar'
        style={{ backgroundColor: '#A6BBC1', padding: '10px' }}
      >
        <div
          style={{
            color: 'red',
            display: 'flex',
            justifyContent: 'flex-start',
            width: '100%',
          }}
        >
          <div style={{ marginLeft: '20px' }}>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{ padding: '5px', fontSize: '16px' }}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const month = moment().month(i).format('YYYY-MM');
                return (
                  <option key={month} value={month}>
                    {moment(month).format('MMMM YYYY')}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    );
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
      <Header
        onUserIconClick={handleUserIconClick}
        isProfileVisible={isBoxVisible}
      />
      <div className='view_body'>
        <div style={{ padding: '50px' }}>
          <div style={{ backgroundColor: 'white' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor='start'
              endAccessor='end'
              style={{ height: '600px' }}
              date={currentDate}
              onNavigate={date => setCurrentDate(date)}
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
            <div className='event-details'>
              <div
                className='view-close-button'
                onClick={() => setSelectedEvent(null)}
              >
                &times;
              </div>{' '}
              {/* Add close button */}
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.description}</p>
              <p>Start: {selectedEvent.start.toLocaleString()}</p>
              <p>End: {selectedEvent.end.toLocaleString()}</p>
              <p>Attendees:</p>
              <div className='attendees-list'>
                {selectedEvent.attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className={`attendee-box ${attendeeTypes[attendee]}`}
                  >
                    {attendee}
                  </div>
                ))}
              </div>
              <div className='button-group'>
                <button onClick={handleEditEvent}>Edit</button>
                <button onClick={handleCancelEvent}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        {isCancelConfirmationVisible && (
          <div className='confirmation-box'>
            <div className='view-close-button' onClick={handleCancelCancel}>
              &times;
            </div>{' '}
            {/* Add close button */}
            <h2>Cancel scheduled lab session?</h2>
            <p>You will permanently cancel this scheduled lab session</p>
            <div className='button-group'>
              <button className='not-now-button' onClick={handleCancelCancel}>
                Not now
              </button>
              <button className='cancel-button' onClick={handleConfirmCancel}>
                Cancel lab session
              </button>
            </div>
          </div>
        )}

        {isBoxVisible && <Profile profileRef={profileRef} />}
      </div>
    </div>
  );
}

export default CalendarView;
