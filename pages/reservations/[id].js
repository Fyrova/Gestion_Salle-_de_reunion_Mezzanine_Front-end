import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import styles from './reservation.module.css';
import dashboardStyles from '../dashboard.module.css';
import { Montserrat } from 'next/font/google';

const mona = Montserrat({
  subsets: ['latin'],
});

const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function RecurrenceOptions({ recurrenceRule, setRecurrenceRule }) {
  const updateRule = (field, value) => {
    const updatedRule = { ...recurrenceRule, [field]: value };
    setRecurrenceRule(updatedRule);
  };

  const toggleByDay = (day) => {
    const byDay = recurrenceRule.byDay || [];
    let updatedByDay;
    if (byDay.includes(day)) {
      updatedByDay = byDay.filter(d => d !== day);
    } else {
      updatedByDay = [...byDay, day];
    }
    updateRule('byDay', updatedByDay);
  };

  return (
    <div className={styles.formSection}>
      <label className={styles.formLabel}>Type de récurrence :</label>
      <select
        className={styles.formInput}
        value={recurrenceRule.type || ''}
        onChange={e => updateRule('type', e.target.value)}
      >
        <option value="">Aucune</option>
        <option value="daily">Quotidienne</option>
        <option value="weekly">Hebdomadaire</option>
        <option value="monthly">Mensuelle</option>
        <option value="yearly">Annuelle</option>
      </select>
      {recurrenceRule.type && (
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Intervalle :</label>
            <input
              className={styles.formInput}
              type="number"
              min="1"
              value={recurrenceRule.interval || 1}
              onChange={e => updateRule('interval', parseInt(e.target.value, 10))}
            />
          </div>
          {recurrenceRule.type === 'weekly' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Jours de la semaine :</label>
              <div className={styles.recurrenceDaysContainer}>
                {daysOfWeek.map(day => (
                  <label key={day} className={styles.recurrenceDayLabel}>
                    <input
                      type="checkbox"
                      checked={recurrenceRule.byDay?.includes(day)}
                      onChange={() => toggleByDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}
          {recurrenceRule.type === 'monthly' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Numéro de semaine :</label>
                <select
                  className={styles.formInput}
                  value={recurrenceRule.weekNumber || ''}
                  onChange={e => updateRule('weekNumber', e.target.value ? parseInt(e.target.value, 10) : '')}
                >
                  <option value="">--</option>
                  <option value="1">1er</option>
                  <option value="2">2ème</option>
                  <option value="3">3ème</option>
                  <option value="4">4ème</option>
                  <option value="-1">Dernier</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Jour de la semaine :</label>
                <select
                  className={styles.formInput}
                  value={recurrenceRule.dayOfWeek || ''}
                  onChange={e => updateRule('dayOfWeek', e.target.value)}
                >
                  <option value="">--</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Date de fin :</label>
        <input
          className={styles.formInput}
          type="date"
          value={recurrenceRule.until || ''}
          onChange={e => {
            const value = e.target.value;
            if (value === '' || !isNaN(new Date(value).getTime())) {
              updateRule('until', value);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function ReservationForm() {
  const router = useRouter();
  const { id } = router.query;

  const [reservation, setReservation] = useState({
    date: '',
    startTime: '',
    endTime: '',
    subject: '',
    organizer: { name: '', email: '' },
    reservationType: 'presentiel',
    equipment: '',
    disposition: 'en U',
    participantsCount: 0,
    departement: '',
  });

  const [recurrenceRule, setRecurrenceRule] = useState({});
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/reservations/${id}`)
        .then(res => res.json())
        .then(data => {
          setReservation({
            date: data.date || '',
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            subject: data.subject || '',
            organizer: data.organizer || { name: '', email: '' },
            reservationType: data.reservationType || 'presentiel',
            equipment: data.equipment || '',
            disposition: data.disposition || 'en U',
            participantsCount: data.participantsCount || 0,
            departement: data.departement || '',
          });
          if (data.recurrenceRule) {
            const parseRRuleString = (rruleString) => {
              const ruleParts = {};
              rruleString.split(';').forEach(part => {
                const [key, value] = part.split('=');
                if (key && value) {
                  ruleParts[key.toLowerCase()] = value;
                }
              });
              let untilDate = '';
              if (ruleParts['until']) {
                const untilStr = ruleParts['until'];
                const year = untilStr.substring(0, 4);
                const month = untilStr.substring(4, 6);
                const day = untilStr.substring(6, 8);
                untilDate = `${year}-${month}-${day}`;
              }
              const recurrenceObj = {
                type: ruleParts['freq'] ? ruleParts['freq'].toLowerCase() : '',
                interval: ruleParts['interval'] ? parseInt(ruleParts['interval'], 10) : 1,
                weekNumber: ruleParts['bysetpos'] ? parseInt(ruleParts['bysetpos'], 10) : null,
                dayOfWeek: ruleParts['byday'] ? (ruleParts['byday'].length === 2 ? ruleParts['byday'] : ruleParts['byday'].split(',')[0]) : null,
                byDay: ruleParts['byday'] ? ruleParts['byday'].split(',') : [],
                until: untilDate,
              };
              return recurrenceObj;
            };
            const parsedRule = parseRRuleString(data.recurrenceRule);
            if (data.endDate) {
              parsedRule.until = data.endDate;
            }
            setRecurrenceRule(parsedRule);
            setRecurrenceEnabled(true);
          }
        })
        .catch(() => {
          setError('Erreur lors du chargement de la réservation');
        });
    }
  }, [id]);

  const handleChange = (field, value) => {
    setReservation(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const start = new Date(`1970-01-01T${reservation.startTime}`);
    const end = new Date(`1970-01-01T${reservation.endTime}`);
    const workStart = new Date(`1970-01-01T07:00`);
    const workEnd = new Date(`1970-01-01T19:00`);

    if (end <= start) {
      setError("L'heure de fin doit être après l'heure de début.");
      return false;
    }
    if (start < workStart || end > workEnd) {
      setError('Les réunions doivent être programmées entre 7h et 19h.');
      return false;
    }
    return true;
  };

  const serializeRecurrenceRule = (rule) => {
    if (!rule || !rule.type) return '';
    let rrule = `FREQ=${rule.type.toUpperCase()}`;
    if (rule.interval && rule.interval > 1) {
      rrule += `;INTERVAL=${rule.interval}`;
    }
    if (rule.type === 'monthly' && rule.weekNumber && rule.dayOfWeek) {
      rrule += `;BYSETPOS=${rule.weekNumber};BYDAY=${rule.dayOfWeek}`;
    } else if (rule.byDay && rule.byDay.length > 0) {
      rrule += `;BYDAY=${rule.byDay.join(',')}`;
    }
    if (rule.until) {
      rrule += `;UNTIL=${rule.until.replace(/-/g, '')}T000000Z`;
    }
    return rrule;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    const urlParams = new URLSearchParams(window.location.search);
    const actionScope = urlParams.get('actionScope') || 'single';

    const payload = {
      ...reservation,
      status: 'CONFIRMED',
      recurrenceRule: recurrenceEnabled ? serializeRecurrenceRule(recurrenceRule) : null,
    };

    try {
      const res = await fetch(id ? `/api/reservations/${id}?actionScope=${actionScope}` : '/api/reservations', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errorMessage = 'Erreur lors de la sauvegarde de la réservation';
        try {
          const data = await res.json();
          errorMessage = data.message || data.error || JSON.stringify(data);
          if (errorMessage.includes('Créneau déjà réservé')) {
            errorMessage = 'Créneau déjà réservé. Veuillez choisir un autre créneau horaire.';
          } else if (errorMessage.includes('La réservation doit être entre 7h et 19h')) {
            errorMessage = 'La réunion doit être programmée entre 7h et 19h.';
          }
        } catch (e) {
          errorMessage = "Erreur lors du traitement de la réponse d'erreur";
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

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Erreur lors de l\'annulation de la réservation');
      }
      router.push('/reservations');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelSeries = async () => {
    if (!id) return;
    if (!confirm('Voulez-vous vraiment annuler toute la série de réservations ?')) return;

    try {
      const res = await fetch(`/api/reservations/${id}/cancelSeries`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Erreur lors de l\'annulation de la série de réservations');
      }
      router.push('/reservations');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem',marginLeft: '700px'}}>
        <main className={`${mona.className} ${styles.container}`}>
          <Header />
          <header className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1>{id ? 'Modifier la réservation' : 'Créer une réservation'}</h1>
              <nav className={styles.nav}>
                <Link href="/dashboard" className={styles.navLink}>Accueil</Link>
                <span className={styles.navSeparator}>|</span>
                <Link href="/reservations" className={styles.navLink}>Liste des réservations</Link>
              </nav>
            </div>
            <div className={styles.actionButtons} style={{ justifyContent: 'flex-start', gap: '2rem', marginLeft: '20px', color: 'white' }}>
              {id && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={styles.button}
                    style={{ backgroundColor: 'red', color: 'white' }}
                  >
                    Annuler la réservation
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSeries}
                    className={styles.button}
                    style={{ backgroundColor: 'red', color: 'white' }}
                    title="Annuler toute la série de réservations"
                  >
                    Annuler la série
                  </button>
                </>
              )}
            </div>
          </header>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date:</label>
                  <input
                    type="date"
                    value={reservation.date}
                    onChange={e => handleChange('date', e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Heure début:</label>
                  <input
                    type="time"
                    value={reservation.startTime}
                    onChange={e => handleChange('startTime', e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Heure fin:</label>
                  <input
                    type="time"
                    value={reservation.endTime}
                    onChange={e => handleChange('endTime', e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Objet:</label>
                  <input
                    type="text"
                    value={reservation.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>
              <fieldset className={styles.formSection}>
                <legend>Organisateur</legend>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nom:</label>
                    <input
                      type="text"
                      value={reservation.organizer?.name || ''}
                      onChange={e => handleChange('organizer', { ...reservation.organizer, name: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email:</label>
                    <input
                      type="email"
                      value={reservation.organizer?.email || ''}
                      onChange={e => handleChange('organizer', { ...reservation.organizer, email: e.target.value })}
                      required
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </fieldset>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type de réservation:</label>
                  <select
                    value={reservation.reservationType || 'presentiel'}
                    onChange={e => handleChange('reservationType', e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Équipement:</label>
                  <input
                    type="text"
                    value={reservation.equipment || ''}
                    onChange={e => handleChange('equipment', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Disposition:</label>
                  <select
                    value={reservation.disposition || 'en U'}
                    onChange={e => handleChange('disposition', e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="en U">En U</option>
                    <option value="theatral">Théâtral</option>
                    <option value="Ronde">Ronde</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre de participants:</label>
                  <input
                    type="number"
                    min="0"
                    value={reservation.participantsCount || 0}
                    onChange={e => handleChange('participantsCount', parseInt(e.target.value, 10))}
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Département:</label>
                <input
                  type="text"
                  value={reservation.departement || ''}
                  onChange={e => handleChange('departement', e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <input
                    type="checkbox"
                    checked={recurrenceEnabled}
                    onChange={e => setRecurrenceEnabled(e.target.checked)}
                  />
                  {' '}Réservation récurrente
                </label>
              </div>
              {recurrenceEnabled && (
                <RecurrenceOptions
                  key={JSON.stringify(recurrenceRule)}
                  recurrenceRule={recurrenceRule}
                  setRecurrenceRule={setRecurrenceRule}
                />
              )}
              {error && <p className={dashboardStyles.orangeGradient} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{error}</p>}
              <div className={styles.buttonGroup}>
                <button type="submit" disabled={submitting} className={styles.button}>
                  {submitting ? 'Envoi...' : id ? 'Mettre à jour la réservation' : 'Créer la réservation'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </Layout>
  );
}