import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import StatContainer from '../components/StatContainer';
import { Montserrat } from 'next/font/google';
import style from './dashboard.module.css';
import Layout from '../components/Layout';

const mona = Montserrat({
  subsets: ['latin'],
});


export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/reservations')
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des réservations');
        }
        return res.json();
      })
      .then(data => {
        setReservations(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const today = new Date();
  const todayStr = today.toDateString();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const resDateStr = new Date(r.date).toDateString();
      return resDateStr === todayStr && r.status === 'CONFIRMED';
    });
  }, [reservations, todayStr]);

  const reservationsMadeToday = useMemo(() => {
    return reservations.filter(r => {
      const createdAtDate = r.createdAt ? new Date(r.createdAt).toDateString() : '';
      return createdAtDate === todayStr;
    });
  }, [reservations, todayStr]);

  const reservationsMadeThisMonth = useMemo(() => {
    return reservations.filter(r => {
      if (!r.createdAt) return false;
      const createdAt = new Date(r.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    });
  }, [reservations, currentMonth, currentYear]);

  const totalHoursReservedToday = useMemo(() => {
    return reservations.reduce((total, r) => {
      const resDateStr = new Date(r.date).toDateString();
      if (resDateStr === todayStr) {
        const start = new Date(`1970-01-01T${r.startTime}`);
        const end = new Date(`1970-01-01T${r.endTime}`);
        const diff = (end - start) / (1000 * 60 * 60);
        return total + (diff > 0 ? diff : 0);
      }
      return total;
    }, 0);
  }, [reservations, todayStr]);

  if (loading) return <p>Chargement du tableau de bord...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Layout>
      <main style={{ padding: '2rem' }} className={ mona.className }>
        <h1 style={{ textAlign: 'center', fontSize: '50px'}}>TABLEAU DE BORD</h1>
        <section>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <StatContainer stats={reservationsMadeToday.length} titre={"Réservations faites aujourd'hui"} />
            <StatContainer stats={reservationsMadeThisMonth.length} titre={"Réservations faites ce mois-ci"} />
            <StatContainer stats={totalHoursReservedToday.toFixed(2)} titre={"Nombre d'heures réservées aujourd'hui"} />
          </div>
        </section>
        <section>
          <h2>Réservations prévues pour aujourd'hui</h2>
          {filteredReservations.length === 0 ? (
            <p>Aucune réservation prévue pour aujourd'hui.</p>
          ) : (
            <table className={style.table}>
              <thead>
                <tr>
              <th>Date</th>
              <th>Heure début</th>
              <th>Heure fin</th>
              <th>Objet</th>
              <th>Organisateur</th>
              <th>Département</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map(reservation => (
              <tr key={reservation.id}>
                <td>{reservation.date}</td>
                <td>{reservation.startTime}</td>
                <td>{reservation.endTime}</td>
                <td>{reservation.subject}</td>
                <td>{reservation.organizer?.name || 'N/A'}</td>
                <td>{reservation.departement || 'N/A'}</td>
                <td>{reservation.status}</td>
              </tr>
            ))}
          </tbody>
            </table>
          )}
        </section>
        <section>
          <h2>Réservations faites aujourd'hui</h2>
          {reservationsMadeToday.length === 0 ? (
            <p>Aucune réservation faite aujourd'hui.</p>
          ) : (
            <table className={style.table}>
              <thead>
                <tr>
              <th>Date création</th>
              <th>Heure début</th>
              <th>Heure fin</th>
              <th>Objet</th>
              <th>Organisateur</th>
              <th>Département</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservationsMadeToday.map(reservation => (
              <tr key={reservation.id}>
                <td>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString() : 'N/A'}</td>
                <td>{reservation.startTime}</td>
                <td>{reservation.endTime}</td>
                <td>{reservation.subject}</td>
                <td>{reservation.organizer?.name || 'N/A'}</td>
                <td>{reservation.departement || 'N/A'}</td>
                <td>{reservation.status}</td>
              </tr>
            ))}
          </tbody>
            </table>
          )}
        </section>
      </main>
      </Layout>
    </>
  );
}
