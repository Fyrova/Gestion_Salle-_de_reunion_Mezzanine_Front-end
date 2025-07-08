import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import dynamic from 'next/dynamic';
import OrganizerFilterInput from '../../components/OrganizerFilterInput';

const ReservationCalendar = dynamic(() => import('../../components/ReservationCalendar'), { ssr: false });

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(null);
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = (organizerName = '') => {
    setLoading(true);
    let url = 'http://localhost:8080/api/reservations';
    if (organizerName) {
      url += `?organizerName=${encodeURIComponent(organizerName)}`;
    }
    fetch(url)
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
        console.error('Erreur lors du chargement des réservations:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleOrganizerFilterChange = (e) => {
    const value = e.target.value;
    setOrganizerFilter(value);
    fetchReservations(value);
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations;
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    if (selectedDate) {
      filtered = filtered.filter(r => new Date(r.date).toDateString() === selectedDate.toDateString());
    }
    return filtered;
  }, [filterStatus, selectedDate, reservations]);

  if (loading) return <p>Chargement des réservations...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Liste des réservations</h1>
        <nav style={{ marginBottom: '1rem' }}>
          <Link href="/">Accueil</Link> | <Link href="/reservations/create">Créer une réservation</Link>
        </nav>
        <div style={{ marginBottom: '1rem' }}>
          <label>Filtrer par organisateur: </label>
          <OrganizerFilterInput value={organizerFilter} onChange={handleOrganizerFilterChange} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Filtrer par statut: </label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">Tous</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
        <ReservationCalendar reservations={reservations} onChange={setSelectedDate} />
        {filteredReservations.length === 0 ? (
          <p>Aucune réservation trouvée.</p>
        ) : (
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure début</th>
                <th>Heure fin</th>
                <th>Objet</th>
                <th>Organisateur</th>
                <th>Date création</th>
                <th>Date modification</th>
                <th>Date réunion</th>
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
                  <td>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString() : 'N/A'}</td>
                  <td>{reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleString() : 'N/A'}</td>
                  <td>{reservation.date}</td>
                  <td>{reservation.status}</td>
                  <td>
                    <a href={`/reservations/${reservation.id}`} title="Modifier la réservation" style={{ cursor: 'pointer' }}>
                      &#9998;
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <footer style={{ backgroundColor: '#004080', padding: '1rem', color: 'white', marginTop: '2rem', textAlign: 'center' }}>
        &copy; 2024 Economic Development Board Madagascar
      </footer>
    </>
  );
}
