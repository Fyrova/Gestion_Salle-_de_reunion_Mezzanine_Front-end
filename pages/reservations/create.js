import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';
import { Montserrat } from 'next/font/google';
import styles from './reservation.module.css';
import Bouton from '../../components/Bouton';
import Layout from '../../components/Layout';

const mona = Montserrat({
  subsets: ['latin'],
});

export default function CreateReservation() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [participants, setParticipants] = useState([{ name: '', email: ''}]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Remove participants state and handlers since replaced by participantsCount
  // Add new states for reservationType, equipment, disposition, participantsCount
  const [reservationType, setReservationType] = useState('presentiel');
  const [equipment, setEquipment] = useState('');
  const [disposition, setDisposition] = useState('en U');
  const [participantsCount, setParticipantsCount] = useState(0);

  // New state for recurrence options
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);

  // New state for departement
  const [departement, setDepartement] = useState('');

  // Remove participant handlers

  const validateForm = () => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const workStart = new Date(`1970-01-01T07:00`);
    const workEnd = new Date(`1970-01-01T19:00`);

    if (end <= start) {
      setError('L\'heure de fin doit être après l\'heure de début.');
      return false;
    }
    if (start < workStart || end > workEnd) {
      setError('Les réunions doivent être programmées entre 7h et 19h.');
      return false;
    }
    // Remove participants validation since replaced by participantsCount
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    // Helper function to serialize recurrenceRule object to iCal RRULE string
    const serializeRecurrenceRule = (rule) => {
      if (!rule || !rule.type) return '';
      let rrule = `FREQ=${rule.type}`;
      if (rule.interval && rule.interval > 1) {
        rrule += `;INTERVAL=${rule.interval}`;
      }
      if (rule.type === 'MONTHLY' && rule.weekNumber && rule.dayOfWeek) {
        rrule += `;BYSETPOS=${rule.weekNumber};BYDAY=${rule.dayOfWeek}`;
      } else if (rule.byDay && rule.byDay.length > 0) {
        rrule += `;BYDAY=${rule.byDay.join(',')}`;
      }
      if (rule.until) {
        rrule += `;UNTIL=${rule.until.replace(/-/g, '')}T000000Z`;
      }
      return rrule;
    };

    const reservation = {
      date,
      startTime,
      endTime,
      subject,
      organizer: {
        name: organizerName,
        email: organizerEmail,
      },
      reservationType,
      equipment,
      disposition,
      participantsCount,
      departement,
      status: 'CONFIRMED',
      recurrenceRule: recurrenceEnabled ? serializeRecurrenceRule(recurrenceRule) : null,
    };

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      if (!res.ok) {
        let errorMessage = 'Erreur lors de la création de la réservation';
        try {
          const data = await res.json();
          errorMessage = data.message || data.error || JSON.stringify(data);
          if (errorMessage.includes('Créneau déjà réservé')) {
            errorMessage = 'Créneau déjà réservé. Veuillez choisir un autre créneau horaire.';
          } else if (errorMessage.includes('La réservation doit être entre 7h et 19h')) {
            errorMessage = 'La réunion doit être programmée entre 7h et 19h.';
          }
        } catch (e) {
          errorMessage = 'Erreur lors du traitement de la réponse d\'erreur';
        }
        throw new Error(errorMessage);
      }
      router.push('/reservations');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Layout>
      <main style={{ padding: '2rem' }} className={ mona.className }>
        <h1>Créer une réservation</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignContent:'baseline' }}>
            <div className={styles.container}>
              <h3>Organisateur</h3>
              <div className={styles.formgroup}>
                <label for="nom">Nom</label>
                <input type="text" name='nom' value={organizerName} onChange={e => setOrganizerName(e.target.value)} required />
              </div>
              <div className={styles.formgroup}>
                <label for="email">Email</label>
                <input type="email" name="email" value={organizerEmail} onChange={e => setOrganizerEmail(e.target.value)} required />
              </div>
            </div>

            <div className={styles.container}>
              <h3>Objet de la réservation</h3>
              <textarea value={subject} onChange={e => setSubject(e.target.value)} required rows="7" cols="80"/>
            </div>
            </div>

          

          <div className={styles.container}>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'baseline' }}>

              <div className={styles.formgroup}>
                <label for="date">Date:</label>
                <input type="date" name="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>

            
              <div className={styles.formgroup}>
                <label for="heuredebut">Heure début:</label>
                <input type="time" name="heuredebut" value={startTime} onChange={e => setStartTime(e.target.value)} required />
              </div>
              <div className={styles.formgroup}>
                <label for="heurefin">Heure fin:</label>
                <input type="time" name="heurefin" value={endTime} onChange={e => setEndTime(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '1rem' }}>
              <div className={styles.formgroup}>
                <label for="disposition">Disposition:</label>
                <select name ="disposition" className={styles.select} value={disposition} onChange={e => setDisposition(e.target.value)}>
                  <option value="en U">En U</option>
                  <option value="theatral">Théâtral</option>
                  <option value="Ronde">Ronde</option>
                </select>
              </div>
              <div className={styles.formgroup}>
                <label for="nbparticipants">Nombre de participants:</label>
                <input type="number" name='nbparticipants' min="0" value={isNaN(participantsCount) ? 0 : participantsCount} onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setParticipantsCount(isNaN(val) ? 0 : val);
                }} />
              </div>
            </div>

          </div>
          
          <div className={styles.container}>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap:'1rem' }}>

              <div className={styles.formgroup}>
                <label for="equipement">Équipement:</label>
                <input type="text" name="equipement" value={equipment} onChange={e => setEquipment(e.target.value)} />
              </div>
              <div className={styles.formgroup}>
                <label for="departement">Département:</label>
                <input type="text" name="departement" value={departement} onChange={e => setDepartement(e.target.value)} />
              </div>

            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap:'1rem' }}>

              <div className={styles.formgroup}>
                <label for="typereservation">Type de réservation:</label>
                <select name="typereservation" value={reservationType} onChange={e => setReservationType(e.target.value)}>
                  <option value="presentiel">Présentiel</option>
                  <option value="hybride">Hybride</option>
                </select>
              </div>
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={recurrenceEnabled}
                    onChange={e => setRecurrenceEnabled(e.target.checked)}
                  />
                  Réservation récurrente
                </label>
              </div>

            </div>

          </div>

          {recurrenceEnabled && (

            <div className={styles.container}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '1rem' }}>
                <div>
                  <div className={styles.formgroup}>
                    <label>Type de récurrence :</label>
                    <select
                      value={recurrenceRule.type || ''}
                      onChange={e => setRecurrenceRule({ ...recurrenceRule, type: e.target.value })}
                    >
                      <option value="">Aucune</option>
                      <option value="DAILY">Quotidienne</option>
                      <option value="WEEKLY">Hebdomadaire</option>
                      <option value="MONTHLY">Mensuelle</option>
                      <option value="YEARLY">Annuelle</option>
                    </select>
                  </div>
                    <div className={styles.formgroup}>
                      <label>Intervalle :</label>
                      <input
                        type="number"
                        min="1"
                        value={isNaN(recurrenceRule.interval) ? 1 : recurrenceRule.interval}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          setRecurrenceRule({ ...recurrenceRule, interval: isNaN(val) ? 1 : val });
                        }}
                      />
                    </div>
                  </div>
                {recurrenceRule.type === 'WEEKLY' && (
                  <div className={styles.formgroup}>
                    <label>Jours de la semaine :</label>
                    <div>
                      {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                        <label key={day} style={{ marginRight: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={recurrenceRule.byDay?.includes(day) || false}
                            onChange={e => {
                              const byDay = recurrenceRule.byDay || [];
                              if (e.target.checked) {
                                setRecurrenceRule({ ...recurrenceRule, byDay: [...byDay, day] });
                              } else {
                                setRecurrenceRule({ ...recurrenceRule, byDay: byDay.filter(d => d !== day) });
                              }
                            }}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {recurrenceRule.type === 'MONTHLY' && (
                  <>
                    <div className={styles.formgroup}>
                      <label>Numéro de semaine :</label>
                      <select
                        value={recurrenceRule.weekNumber || ''}
                        onChange={e => setRecurrenceRule({ ...recurrenceRule, weekNumber: e.target.value ? parseInt(e.target.value, 10) : null })}
                      >
                        <option value="">--</option>
                        <option value="1">1er</option>
                        <option value="2">2ème</option>
                        <option value="3">3ème</option>
                        <option value="4">4ème</option>
                        <option value="-1">Dernier</option>
                      </select>
                    </div>
                    <div className={styles.formgroup}>
                      <label>Jour de la semaine :</label>
                      <select
                        value={recurrenceRule.dayOfWeek || ''}
                        onChange={e => setRecurrenceRule({ ...recurrenceRule, dayOfWeek: e.target.value })}
                      >
                        <option value="">--</option>
                        <option value="MO">Lundi</option>
                        <option value="TU">Mardi</option>
                        <option value="WE">Mercredi</option>
                        <option value="TH">Jeudi</option>
                        <option value="FR">Vendredi</option>
                        <option value="SA">Samedi</option>
                        <option value="SU">Dimanche</option>
                      </select>
                    </div>
                  </>
                )}
                <div className={styles.formgroup}>
                  <label>Date de fin :</label>
                  <input
                    type="date"
                    value={recurrenceRule.until || ''}
                    onChange={e => {
                      let value = e.target.value;
                      // Convert dd-mm-yyyy to yyyy-mm-dd if needed
                      if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
                        const parts = value.split('-');
                        value = `${parts[2]}-${parts[1]}-${parts[0]}`;
                      }
                      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
                      if (isValidDate || value === '') {
                        setRecurrenceRule({ ...recurrenceRule, until: value });
                      } else {
                        // Ignore invalid input or show error if needed
                        console.warn('Date de fin invalide pour la récurrence');
                      }
                    }}
                  />
                </div>
              </div>
          
          </div>
          )}
          {error && <p style={{ color: 'red', marginTop: '1rem', marginBottom: '0.5rem' }}>{error}</p>}
          <button type="submit" disabled={submitting} className={`${styles.button} ${mona.className}`}>{submitting ? 'Envoi...' : 'Créer la réservation'}</button>
        </form>
      </main>
      </Layout>
    </>
  );
}
