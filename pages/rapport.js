import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function Rapport() {
  const [date, setDate] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = (selectedDate) => {
    if (!selectedDate) {
      setReservations([]);
      return;
    }
    setLoading(true);
    const url = `http://localhost:8080/api/reservations?date=${selectedDate}&status=CONFIRMED&view=planned`;
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
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    fetchReservations(selectedDate);
  };

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="/logoEDBM-auth.822bbb75.png" alt="EDBM Logo" style="width: 100px; height: auto;"/>
        <h2>Rapport des réservations prévues le ${date}</h2>
      </div>
      <div>${printContents}</div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Rapport des réservations</h1>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="date">Sélectionnez une date : </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={handleDateChange}
          />
        </div>
        {loading && <p>Chargement des réservations...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {reservations.length > 0 && (
          <>
            <div id="printableArea">
              <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure début</th>
                    <th>Heure fin</th>
                    <th>Objet</th>
                    <th>Organisateur</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td>{reservation.date}</td>
                      <td>{reservation.startTime}</td>
                      <td>{reservation.endTime}</td>
                      <td>{reservation.subject}</td>
                      <td>{reservation.organizer?.name || 'N/A'}</td>
                      <td>{reservation.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handlePrint} style={{ marginTop: '1rem' }}>Imprimer</button>
          </>
        )}
        {reservations.length === 0 && !loading && !error && <p>Aucune réservation confirmée pour cette date.</p>}
      </main>
    </>
  );
}
