import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // default styling

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());

  const handleChange = (selectedDate) => {
    setDate(selectedDate);
    console.log('Selected Date:', selectedDate);
  };

  return (
    <div className="calendar-container">
      <h2>Select a Date</h2>
      <Calendar
        onChange={handleChange}
        value={date}
      />
      <p>You selected: {date.toDateString()}</p>
    </div>
  );
};

export default MyCalendar;
