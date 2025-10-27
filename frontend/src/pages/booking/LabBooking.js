import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header, Profile } from '../../components/organisms';
import '../../styles/booking.css';
import axios from 'axios';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import Select from 'react-select';

export default function LabBooking() {
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [isPollVisible, setIsPollVisible] = useState(false);
  const [pollDate, setPollDate] = useState("");
  const [uEmail, setEmail] = useState("");
  const [id, setId] = useState("");
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setEmail(decodedToken.email || "");
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
      setEmail(event.uEmail || "");
    }
  }, [location.state]);

  const handleUserIconClick = () => {
    setIsBoxVisible(!isBoxVisible);
  };

  // Additional booking logic would go here...

  return (
    <div>
      <Header onUserIconClick={handleUserIconClick} isProfileVisible={isBoxVisible} />
      <div className="booking-container">
        <h1>Lab Booking</h1>
        {/* Booking form content would go here */}
      </div>
      {isBoxVisible && <Profile profileRef={profileRef} />}
    </div>
  );
}