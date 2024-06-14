import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import axios from 'axios';
import '../components/View.css';
import ToHeader from '../components/ToHeder';
import Profile from '../components/Profile';

const localizer = momentLocalizer(moment);

export default function () {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBoxVisible, setIsBoxVisible] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const formattedEvents = response.data.map(booking => ({
          id: booking._id,
          start: new Date(booking.startTime),
          end: new Date(booking.endTime),
          title: booking.title,
          description: booking.description
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const CustomToolbar = () => {
    return (
      <div className="rbc-toolbar custom-toolbar">
        <div className="toolbar-container">
          <div className="toolbar-date">
            <div className="toolbar-date-box">
              {moment().format('MMMM')} {moment().format('YYYY')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  const customEventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: '#00b528', // Green background color
      color: '#fff', // White text color
      borderRadius: '0px', // Rounded corners
      border: 'none', // No border
      display: 'block', // Ensure block display
      position: 'relative', // Relative positioning
      textAlign: 'center', // Center text
      height: '100%',
      width: '100%'
    };
  
    if (!event.start || !event.end) {
      return { style };
    }
  
    return {
      style,
      children: (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}></div>
      ),
    };
  };
  
  const customFormats = {
    dayFormat: (date, culture, localizer) => localizer.format(date, 'dddd', culture),
    weekdayFormat: (date, culture, localizer) => localizer.format(date, 'dddd', culture)
  };

  return (
    <div>
      <ToHeader onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible}/>
      <div className='view_body'>
        <div className='calendar-container'>
          <div className='calendar-wrapper'>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '800px' }}
              formats={customFormats}
              eventPropGetter={customEventStyleGetter}
              onSelectEvent={handleSelectEvent}
              components={{
                toolbar: CustomToolbar,
              }}
              dayPropGetter={date => ({
                className: 'rbc-day-red', // Class for custom styles
              })}
            />
          </div>
          {selectedEvent && (
            <div className="event-details">
              <button className="close-button" onClick={() => setSelectedEvent(null)}>×</button>
              <h3>{selectedEvent.title}</h3>
              <p>{selectedEvent.description}</p>
              <p>Start: {selectedEvent.start.toLocaleString()}</p>
              <p>End: {selectedEvent.end.toLocaleString()}</p>
            </div>
          )}
        </div>
        {isBoxVisible && <Profile />}
      </div>
    </div>
  );
}

