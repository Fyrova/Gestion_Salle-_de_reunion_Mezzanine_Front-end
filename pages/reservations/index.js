
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import dynamic from 'next/dynamic';
import OrganizerFilterInput from '../../components/OrganizerFilterInput';
import { Montserrat, Inter } from 'next/font/google';
import styles from './reservations.module.css';
import Layout from '../../components/Layout';

const inter = Inter({
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
        // Sort reservations by updatedAt descending (most recent first)
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.updatedAt);
          const dateB = new Date(b.updatedAt);
          return dateB - dateA;
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
      <Layout>
        <main className={`${styles.pageContainer} `}>
          <h1 className={styles.title}>LISTE DES RESERVATIONS</h1>
          <div className={styles.filtersCalendarContainer}>
            <div className={styles.calendarContainer}>
              <ReservationCalendar reservations={reservations} onChange={setSelectedDate}/>
            </div>
            <div className={styles.filtersColumn}>
              <div className={styles.filters}>
                <label>Filtrer par organisateur : </label>
                <OrganizerFilterInput value={organizerFilter} onChange={handleInputChange} />
                <button
                  onClick={() => handleFilterClick('ordinary')}
                  title="Afficher les réservations ordinaires (occurrences uniquement)"
                  type="button"
                  className={styles.filterButton}
                >
                  Simple
                </button>
                <button
                  onClick={() => handleFilterClick('recurring')}
                  title="Afficher les séries de réservations récurrentes"
                  type="button"
                  className={styles.filterButton}
                >
                  Récurrentes
                </button>
              </div>
              <div className={styles.filters}>
                <label>Filtrer par statut: </label>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={styles.filterSelect}>
                  <option value="ALL">Tous</option>
                  <option value="CONFIRMED">Confirmé</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {Object.keys(groupedReservations).length === 0 ? (
            <p className={styles.noDataMessage}>Aucune réservation trouvée.</p>
          ) : (
            <>
              {/* Show grouped recurring series with headers only when filtering by organizer */}        
          {filterMode === 'recurring' && organizerFilter.trim() !== '' ? (
            Object.entries(groupedReservations).map(([groupId, group]) => {
              const isRecurringSeries = group.length >= 1;
              if (isRecurringSeries) {
                return (
                  <div key={groupId} className={styles.groupContainer}>
                    <div className={styles.groupHeader}>
                      <h3>Série de réservations {groupId}</h3>
                      <a
                        href={`/reservations/${group[0].parentReservation ? group[0].parentReservation.id : group[0].id}?actionScope=series`}
                        title="Modifier la série"
                        className={styles.editLink}
                        aria-label="Modifier la série"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-10-4l8-8 4 4-8 8H7v-4z" />
                        </svg>
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
                          <td><span className={`${styles.status} ${
                              reservation.status === 'CONFIRMED' ? styles['status-confirmed'] :
                              reservation.status === 'CANCELLED' ? styles['status-cancelled'] : ''
                            }`}>
                              {reservation.status}
                            </span></td>
                          <td>
                            <a
                              href={`/reservations/${reservation.id}?actionScope=single`}
                              title="Modifier la réservation"
                              className={styles.editLink}
                              aria-label="Modifier la réservation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-10-4l8-8 4 4-8 8H7v-4z" />
                              </svg>
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
                          <td>
                            <span className={`${styles.status} ${
                              reservation.status === 'CONFIRMED' ? styles['status-confirmed'] :
                              reservation.status === 'CANCELLED' ? styles['status-cancelled'] : ''
                            }`}>
                              {reservation.status}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`/reservations/${reservation.id}?actionScope=single`}
                              title="Modifier la réservation"
                              className={styles.editLink}
                              aria-label="Modifier la réservation"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-10-4l8-8 4 4-8 8H7v-4z" />
                              </svg>
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
      </Layout>
    </>
  );
}

