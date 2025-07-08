import React from 'react';
import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

const ReservationCalendar = ({ value, onChange, reservations }) => {
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayReservations = reservations.filter(
        (reservation) => new Date(reservation.date).toDateString() === date.toDateString()
      );
      if (dayReservations.length > 0) {
        return <div className="dot" />;
      }
    }
    return null;
  };

  return <Calendar onChange={onChange} value={value} tileContent={tileContent} />;
};

export default ReservationCalendar;
