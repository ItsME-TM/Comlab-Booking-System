import React from 'react';
import './App.css';

function MyButton() {
  return (
    <button className="my-button">
      Scheduling Poll
    </button>
  );
}

export default function MyApp() {
  return (
    <div className="my-app">
      <h1>Book Lab Session</h1>
      <MyButton />
      <div className="container">
        <h3>CO1 Lab Availability</h3>
      </div>
    </div>
  );
}


