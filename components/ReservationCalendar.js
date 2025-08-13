import dynamic from 'next/dynamic';
import { Montserrat } from 'next/font/google';
import styles from './Calendar.module.css';
import 'react-calendar/dist/Calendar.css'; 
import React from 'react';

const mona = Montserrat({ subsets: ['latin'] });
const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

const ReservationCalendar = ({ value, onChange, reservations }) => {
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasConfirmedReservations = reservations.some(
        (reservation) => 
          new Date(reservation.date).toDateString() === date.toDateString() && 
          reservation.status === 'CONFIRMED'
      );
      return hasConfirmedReservations ? <div className={styles.dot} /> : null;
    }
    return null;
  };

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        onChange={onChange}
        value={value}
        tileContent={tileContent}
        className={`${styles.reactCalendar} ${mona.className}`}
      />
    </div>
  );
};

export default ReservationCalendar;

