import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Layout from '../components/Layout';
import styles from './dashboard.module.css';
import footerStyles from '../components/Footer.module.css';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

export default function Rapport() {
  const [date, setDate] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('day'); // day, week, month

  const fetchReservations = (selectedDate, selectedFilterType) => {
    if (!selectedDate) {
      setReservations([]);
      return;
    }
    
    setLoading(true);
    let url = `http://localhost:8080/api/reservations?date=${selectedDate}&status=CONFIRMED&periodType=${selectedFilterType}`;
    
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
    fetchReservations(selectedDate, filterType);
  };

  const handleFilterTypeChange = (e) => {
    const selectedFilterType = e.target.value;
    setFilterType(selectedFilterType);
    if (date) {
      fetchReservations(date, selectedFilterType);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('printableArea').innerHTML;
    const originalContents = document.body.innerHTML;
    
    let title = '';
    switch (filterType) {
      case 'week':
        title = `Rapport des réservations prévues la semaine du ${date}`;
        break;
      case 'month':
        title = `Rapport des réservations prévues le mois du ${date}`;
        break;
      default:
        title = `Rapport des réservations prévues le ${date}`;
    }

    document.body.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="/logoEDBM-auth.822bbb75.png" alt="EDBM Logo" style="width: 100px; height: auto;"/>
        <h2>${title}</h2>
      </div>
      <div>${printContents}</div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const getFilterTitle = () => {
    if (!date) return 'LISTE DES RESERVATIONS';
    
    switch (filterType) {
      case 'week':
        return `Réservations de la semaine du ${date}`;
      case 'month':
        return `Réservations du mois du ${date}`;
      default:
        return `Réservations du ${date}`;
    }
  };

  return (
    <>
      <Header />
      <Layout>
        <main className={`${styles.pageContainer}`}>
          <h1 className={styles.title}>{getFilterTitle()}</h1>
          
          <div className={styles.filtersCalendarContainer}>
            <div className={styles.filtersColumn}>
              <div className={styles.filters} style={{marginLeft:'500px'}}>
                <label>Filtrer par : </label>
                <select 
                  value={filterType} 
                  onChange={handleFilterTypeChange}
                  className={styles.filterSelect}
                  style={{ width: '120px', marginRight: '10px' }}
                >
                  <option value="day">Jour</option>
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                </select>
                
                <label>Date : </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={handleDateChange}
                  className={styles.filterSelect}
                  style={{ width: '30%' }}
                />
              </div>
            </div>
          </div>
          
          {loading && <p>Chargement des réservations...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {reservations.length > 0 && (
            <>
              <div id="printableArea" style={{ width: '100%' }}>
                <table className={styles.table} style={{ width: '100%'}}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Heure début</th>
                      <th>Heure fin</th>
                      <th>Objet</th>
                      <th>Organisateur</th>
                      <th>Département</th>
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
                        <td>{reservation.departement || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handlePrint} className={`${styles.button}`} style={{ marginTop: '1rem', backgroundColor: '#4299e1', color: 'white' }}>Imprimer</button>
            </>
          )}
        </main>
      </Layout>
      <footer style={{backgroundColor:'#6b46c1',color: '#ccc',textAlign: 'center',paddingLeft:'150px', position:'fixed', fontSize:'1rem'
        ,marginTop:'2rem',boxShadow:'0 -2px 8px rgba(0, 0, 0, 0.2)',display:'flex',
        height:'60px',bottom:'0',width:'100%',justifyContent:'center',alignItems:'center'}}>
        © {new Date().getFullYear()} EDBM - Gestion de la salle Mezzanine
      </footer>
    </>
  );
}
