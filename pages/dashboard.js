import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Link from 'next/link';
import StatContainer from '../components/StatContainer';
import DashboardChart from '../components/DashboardChart';
import { Montserrat } from 'next/font/google';
import style from './dashboard.module.css';
import reservationStyle from '../pages/reservations/reservation.module.css';
import Layout from '../components/Layout';

const mona = Montserrat({
  subsets: ['latin'],
});

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getStartOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(date.setDate(diff));
}

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('day'); // day, week, month, year

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

  // Réservations prévues pour aujourd'hui (toujours affichées)
  const todaysReservations = useMemo(() => {
    return reservations.filter(r => {
      return r.date && new Date(r.date).toDateString() === todayStr;
    });
  }, [reservations, todayStr]);

  // Réservations créées aujourd'hui
  const reservationsMadeToday = useMemo(() => {
    return reservations.filter(r => {
      const createdAtDate = r.createdAt ? new Date(r.createdAt).toDateString() : '';
      return createdAtDate === todayStr;
    });
  }, [reservations, todayStr]);

  // Réservations créées ce mois-ci
  const reservationsMadeThisMonth = useMemo(() => {
    return reservations.filter(r => {
      if (!r.createdAt) return false;
      const createdAt = new Date(r.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    });
  }, [reservations, currentMonth, currentYear]);

  // Heures réservées aujourd'hui
  const totalHoursReservedToday = useMemo(() => {
    return todaysReservations.reduce((total, r) => {
      const start = new Date(`1970-01-01T${r.startTime}`);
      const end = new Date(`1970-01-01T${r.endTime}`);
      const diff = (end - start) / (1000 * 60 * 60);
      return total + (diff > 0 ? diff : 0);
    }, 0);
  }, [todaysReservations]);

  // Données pour le graphique (réservations prévues groupées par période)
  const reservationsChartData = useMemo(() => {
    const dataMap = new Map();

    // Traitement différent selon la période sélectionnée
    reservations.forEach(r => {
      if (!r.date) return;
      
      const resDate = new Date(r.date);
      let periodKey, periodLabel;

      switch (filterPeriod) {
        case 'day':
          // Groupement par heure pour le jour en cours
          if (resDate.toDateString() === todayStr) {
            periodKey = `hour_${resDate.getHours()}`;
            periodLabel = `${resDate.getHours()}h`;
          }
          break;
        
        case 'week':
          // Groupement par jour de la semaine pour la semaine en cours
          if (getWeekNumber(resDate) === getWeekNumber(today)) {
            periodKey = `day_${resDate.getDay()}`;
            periodLabel = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][resDate.getDay()];
          }
          break;
        
        case 'month':
          // Groupement par jour du mois pour le mois en cours
          if (resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear) {
            periodKey = `monthday_${resDate.getDate()}`;
            periodLabel = resDate.getDate();
          }
          break;
        
        case 'year':
          // Groupement par mois pour l'année en cours
          if (resDate.getFullYear() === currentYear) {
            periodKey = `month_${resDate.getMonth()}`;
            periodLabel = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][resDate.getMonth()];
          }
          break;
      }

      if (periodKey) {
        const current = dataMap.get(periodKey) || { period: periodLabel, frequency: 0 };
        dataMap.set(periodKey, {
          ...current,
          frequency: current.frequency + 1
        });
      }
    });

    // Conversion en tableau et tri
    const result = Array.from(dataMap.values());
    
    switch (filterPeriod) {
      case 'day':
        return result.sort((a, b) => parseInt(a.period) - parseInt(b.period));
      case 'week':
        return result.sort((a, b) => ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].indexOf(a.period) - 
                                     ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].indexOf(b.period));
      case 'month':
        return result.sort((a, b) => parseInt(a.period) - parseInt(b.period));
      case 'year':
        return result.sort((a, b) => ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].indexOf(a.period) - 
                                     ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].indexOf(b.period));
      default:
        return result;
    }
  }, [reservations, filterPeriod, todayStr, currentMonth, currentYear]);

  // Réservations filtrées pour les stats de statut
  const filteredReservationsForStats = useMemo(() => {
    return reservations.filter(r => {
      if (!r.date) return false;
      const resDate = new Date(r.date);
      
      switch (filterPeriod) {
        case 'day':
          return resDate.toDateString() === todayStr;
        case 'week':
          return getWeekNumber(resDate) === getWeekNumber(today);
        case 'month':
          return resDate.getMonth() === currentMonth;
        case 'year':
          return resDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  }, [reservations, filterPeriod, todayStr, currentMonth, currentYear]);

  if (loading) return <p>Chargement du tableau de bord...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <Layout>
      <main className={`${mona.className} ${style.pageContainer}`}>
        <h1 className={style.title}>TABLEAU DE BORD</h1>
        
        {/* Section Statistiques */}
        <section className={style.section}>
          <div className={style.statsGrid}>
            <StatContainer 
              stats={reservationsMadeToday.length} 
              titre={"Réservations faites aujourd'hui"} 
              colorClass="greenText" 
            />
            <StatContainer 
              stats={reservationsMadeThisMonth.length} 
              titre={"Réservations faites ce mois-ci"} 
              colorClass="orangeText" 
            />
            <StatContainer 
              stats={totalHoursReservedToday.toFixed(2)} 
              titre={"Heures réservées aujourd'hui"} 
              colorClass="blueText" 
            />
          </div>
        </section>

        {/* Section Graphique */}
        <section className={style.section}>
          <div className={style.filterButtons}>
            <button
              className={`${style.filterButton} ${filterPeriod === 'day' ? style.active : ''}`}
              onClick={() => setFilterPeriod('day')}
            >
              Jour
            </button>
            <button
              className={`${style.filterButton} ${filterPeriod === 'week' ? style.active : ''}`}
              onClick={() => setFilterPeriod('week')}
            >
              Semaine
            </button>
            <button
              className={`${style.filterButton} ${filterPeriod === 'month' ? style.active : ''}`}
              onClick={() => setFilterPeriod('month')}
            >
              Mois
            </button>
            <button
              className={`${style.filterButton} ${filterPeriod === 'year' ? style.active : ''}`}
              onClick={() => setFilterPeriod('year')}
            >
              Année
            </button>
          </div>

          <h2>Réservations prévues par {filterPeriod === 'day' ? 'heure' : filterPeriod === 'week' ? 'semaine' : filterPeriod === 'month' ? 'mois' : filterPeriod === 'year' ? 'année' : filterPeriod}</h2>
          {reservationsChartData.length > 0 ? (
            <DashboardChart 
              data={reservationsChartData} 
              period={filterPeriod}
            />
          ) : (
            <p className={style.noDataMessage}>
              Aucune réservation prévue pour cette période.
            </p>
          )}
        </section>

        {/* Section Statuts */}
        <section className={style.section}>
          <h2>Statut des réservations ({filterPeriod === 'day' ? 'aujourd\'hui' : 
                                       filterPeriod === 'week' ? 'cette semaine' : 
                                       filterPeriod === 'month' ? 'ce mois' : 'cette année'})</h2>
          <div className={style.statusGrid}>
            <div className={style.statusCard}>
              <h3 className={style.purpleText}>Confirmées</h3>
              <p className={`${style.statusNumber} ${style.orangeGradient}`}>
                {filteredReservationsForStats.filter(r => r.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className={style.statusCard}>
              <h3 className={style.purpleText}>Annulées</h3>
              <p className={`${style.statusNumber} ${style.orangeGradient}`}>
                {filteredReservationsForStats.filter(r => r.status === 'CANCELLED').length}
              </p>
            </div>
          </div>
        </section>

        {/* Section Réservations prévues aujourd'hui */}
        <section className={style.tableSection}>
          <h2 className={style.blueUnderlineTitle}>Réservations prévues aujourd'hui</h2>
          {todaysReservations.length === 0 ? (
            <p className={style.noDataMessage}>Aucune réservation prévue pour aujourd'hui.</p>
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
                {todaysReservations.map(reservation => (
                  <tr key={reservation.id}>
                  <td>{reservation.date}</td>
                  <td>{reservation.startTime}</td>
                  <td>{reservation.endTime}</td>
                  <td>{reservation.subject}</td>
                  <td>{reservation.organizer?.name || 'N/A'}</td>
                  <td>{reservation.departement || 'N/A'}</td>
                  <td><span className={`${
                    reservation.status === 'CONFIRMED' ? style['status-confirmed'] :
                    reservation.status === 'CANCELLED' ? style['status-cancelled'] : ''
                    }`}>
                    {reservation.status}
                     </span></td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Section Réservations créées aujourd'hui */}
        <section className={style.tableSection}>
          <h2 className={style.blueUnderlineTitle}>Réservations créées aujourd'hui</h2>
          {reservationsMadeToday.length === 0 ? (
            <p className={style.noDataMessage}>Aucune réservation créée aujourd'hui.</p>
          ) : (
            <table className={style.table}>
              <thead>
                <tr>
                  <th>Date réunion</th>
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
                    <td>{reservation.date}</td>
                    <td>{reservation.startTime}</td>
                    <td>{reservation.endTime}</td>
                    <td>{reservation.subject}</td>
                    <td>{reservation.organizer?.name || 'N/A'}</td>
                    <td>{reservation.departement || 'N/A'}</td>
                    <td><span className={`${
                    reservation.status === 'CONFIRMED' ? style['status-confirmed'] :
                    reservation.status === 'CANCELLED' ? style['status-cancelled'] : ''
                    }`}>
                    {reservation.status}
                     </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </Layout>
  );
}