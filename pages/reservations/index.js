import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import dynamic from 'next/dynamic';
import OrganizerFilterInput from '../../components/OrganizerFilterInput';
import { Montserrat } from 'next/font/google';
import styles from './reservation.module.css';

const mona = Montserrat({
  subsets: ['latin'],
});

const ReservationCalendar = dynamic(() => import('../../components/ReservationCalendar').then(mod => mod.default), { ssr: false });

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(null);
  const [organizerFilter, setOrganizerFilter] = useState('');
  const [filterMode, setFilterMode] = useState('simple'); // 'simple' or 'recurring'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = (organizerName = '', filterType = 'recurring') => {
    setLoading(true);
    let url = 'http://localhost:8080/api/reservations';
    const params = new URLSearchParams();
    if (organizerName) {
      params.append('organizerName', organizerName);
      params.append('filterType', filterType);
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement des réservations');
        }
        return res.json();
      })
      .then(data => {
        // Sort reservations by date and startTime
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.startTime);
          const dateB = new Date(b.date + 'T' + b.startTime);
          return dateA - dateB;
        });
        setReservations(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erreur lors du chargement des réservations:', err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations('', 'ordinary');
  }, []);

  const handleInputChange = (e) => {
    setOrganizerFilter(e.target.value);
  };

  // Filtrer uniquement au clic sur les boutons, pas à la saisie
  const handleFilterClick = (filterType) => {
    setFilterMode(filterType === 'ordinary' ? 'simple' : 'recurring');
    fetchReservations(organizerFilter, filterType);
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

  // Group reservations by series (parentReservation id or own id if no parent)
  const groupedReservations = filteredReservations.reduce((groups, reservation) => {
    const groupId = reservation.parentReservation ? reservation.parentReservation.id : reservation.id;
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(reservation);
    return groups;
  }, {});

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }} className={ mona.className }>
        <h1 style={{ textAlign: 'center'}}>LISTE DES RESERVATIONS</h1>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <label>Filtrer par organisateur : </label>
          <OrganizerFilterInput value={organizerFilter} onChange={handleInputChange} />
          <button
            style={{ marginLeft: '0.5rem' }}
            onClick={() => handleFilterClick('ordinary')}
            title="Afficher les réservations ordinaires (occurrences uniquement)"
            type="button"
            className= {mona.className}
          >
            Simple
          </button>
          <button
            style={{ marginLeft: '0.5rem' }}
            onClick={() => handleFilterClick('recurring')}
            title="Afficher les séries de réservations récurrentes"
            type="button"
            className= {mona.className}
          >
            Récurrentes
          </button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Filtrer par statut: </label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">Tous</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
        
        <div className="min-h-screen flex flex-col p-4">
        <ReservationCalendar reservations={reservations} onChange={setSelectedDate}/>
        </div>

        {Object.keys(groupedReservations).length === 0 ? (
          <p>Aucune réservation trouvée.</p>
        ) : (
          <>
            {/* Show grouped recurring series with headers only when filtering by organizer */}
        {filterMode === 'recurring' && organizerFilter.trim() !== '' ? (
          Object.entries(groupedReservations).map(([groupId, group]) => {
            const isRecurringSeries = group.length >= 1;
            if (isRecurringSeries) {
              return (
                <div key={groupId} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3>Série de réservations {groupId}</h3>
                    <a
                      href={`/reservations/${group[0].parentReservation ? group[0].parentReservation.id : group[0].id}?actionScope=series`}
                      title="Modifier la série"
                      style={{ cursor: 'pointer', fontSize: '1.5rem', textDecoration: 'none' }}
                    >
                      &#9998;
                    </a>
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Heure début</th>
                        <th>Heure fin</th>
                        <th>Objet</th>
                        <th>Organisateur</th>
                        <th>Date création</th>
                        <th>Date modification</th>
                        <th>Statut</th>
                        <th>recurrence</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.map(reservation => (
                      <tr key={reservation.id}>
                        <td>{reservation.date}</td>
                        <td>{reservation.startTime}</td>
                        <td>{reservation.endTime}</td>
                        <td>{reservation.subject}</td>
                        <td>{reservation.organizer?.name || 'N/A'}</td>
                        <td>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString() : 'N/A'}</td>
                        <td>{reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleString() : 'N/A'}</td>
                        <td>{reservation.status}</td>
                        <td>{reservation.recurrenceRule ? reservation.recurrenceRule : '-'}</td>
                        <td>
                          <a
                            href={`/reservations/${reservation.id}?actionScope=single`}
                            title="Modifier la réservation"
                            style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                          >
                            &#9998;
                          </a>
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return null;
          })
        ) : (
          // Show all simple reservations and individual occurrences in a single table with one header
          <table className={styles.table}>
            <thead>
            <tr>
              <th>Date</th>
              <th>Heure début</th>
              <th>Heure fin</th>
              <th>Objet</th>
              <th>Organisateur</th>
              <th>Département</th>
              <th>Date création</th>
              <th>Date modification</th>
              <th>Statut</th>
              <th>Actions</th>
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
                  <td>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString() : 'N/A'}</td>
                  <td>{reservation.updatedAt ? new Date(reservation.updatedAt).toLocaleString() : 'N/A'}</td>
                  <td>{reservation.status}</td>
                  <td>
                    <a
                      href={`/reservations/${reservation.id}?actionScope=single`}
                      title="Modifier la réservation"
                      style={{ cursor: 'pointer', marginRight: '0.5rem' }}
                    >
                      &#9998;
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
          </>
        )}
      </main>
      <footer style={{ backgroundColor: '#004080', padding: '1rem', color: 'white', marginTop: '2rem', textAlign: 'center' }}>
        &copy; 2024 Economic Development Board Madagascar
      </footer>
    </>
  );
}
