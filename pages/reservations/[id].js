  import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';

const daysOfWeek = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function RecurrenceOptions({ recurrenceRule, setRecurrenceRule }) {
  const updateRule = (field, value) => {
    setRecurrenceRule({ ...recurrenceRule, [field]: value });
  };

  const toggleByDay = (day) => {
    const byDay = recurrenceRule.byDay || [];
    if (byDay.includes(day)) {
      updateRule('byDay', byDay.filter(d => d !== day));
    } else {
      updateRule('byDay', [...byDay, day]);
    }
  };

  return (
    <div>
      <label>Type de récurrence :</label>
      <select
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
        <div>
          <label>Intervalle :</label>
          <input
            type="number"
            min="1"
            value={recurrenceRule.interval || 1}
            onChange={e => updateRule('interval', parseInt(e.target.value, 10))}
          />
        </div>
      )}
      {recurrenceRule.type === 'weekly' && (
        <div>
          <label>Jours de la semaine :</label>
          <div>
            {daysOfWeek.map(day => (
              <label key={day} style={{ marginRight: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={recurrenceRule.byDay?.includes(day) || false}
                  onChange={() => toggleByDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {recurrenceRule.type === 'monthly' && (
        <>
          <div>
            <label>Numéro de semaine :</label>
            <select
              value={recurrenceRule.weekNumber || ''}
              onChange={e => updateRule('weekNumber', e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">--</option>
              <option value="1">1er</option>
              <option value="2">2ème</option>
              <option value="3">3ème</option>
              <option value="4">4ème</option>
              <option value="-1">Dernier</option>
            </select>
          </div>
          <div>
            <label>Jour de la semaine :</label>
            <select
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
        </>
      )}

      <div>
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
              updateRule('until', value);
            } else {
              console.warn('Date de fin invalide pour la récurrence');
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
      // Fetch reservation data for editing
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
              // Parse recurrenceRule string to object if needed
              const parseRRuleString = (rruleString) => {
                console.log('Parsing recurrence rule:', rruleString);
                const ruleParts = {};
                rruleString.split(';').forEach(part => {
                  const [key, value] = part.split('=');
                  if (key && value) {
                    ruleParts[key.toLowerCase()] = value;
                  }
                });
                console.log('Parsed rule parts:', ruleParts);
              const recurrenceObj = {
                type: ruleParts['freq'] ? ruleParts['freq'].toLowerCase() : '',
                interval: ruleParts['interval'] ? parseInt(ruleParts['interval'], 10) : 1,
                weekNumber: ruleParts['bysetpos'] ? parseInt(ruleParts['bysetpos'], 10) : null,
                dayOfWeek: ruleParts['byday'] ? (ruleParts['byday'].length === 2 ? ruleParts['byday'] : ruleParts['byday'].split(',')[0]) : null,
                byDay: ruleParts['byday'] ? ruleParts['byday'].split(',') : [],
                until: ruleParts['until'] ? ruleParts['until'].slice(0,4) + '-' + ruleParts['until'].slice(4,6) + '-' + ruleParts['until'].slice(6,8) : '',
              };
                console.log('Recurrence object:', recurrenceObj);
                return recurrenceObj;
              };
              console.log('Récupération de la règle de récurrence:', data.recurrenceRule);
              const parsedRule = parseRRuleString(data.recurrenceRule);
              setRecurrenceRule(parsedRule);
              setRecurrenceEnabled(true);
              // Set endDate from data if present
              if (data.endDate) {
                console.log('Récupération de la date de fin:', data.endDate);
                setRecurrenceRule(prev => ({ ...prev, until: data.endDate }));
              }
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
    // Add INTERVAL only once
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

      // Determine actionScope from query param or default to 'single'
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
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>{id ? 'Modifier la réservation' : 'Créer une réservation'}</h1>
        <nav style={{ marginBottom: '1rem' }}>
          <Link href="/">Accueil</Link> | <Link href="/reservations">Liste des réservations</Link>
        </nav>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Date:</label>
            <input
              type="date"
              value={reservation.date}
              onChange={e => handleChange('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Heure début:</label>
            <input
              type="time"
              value={reservation.startTime}
              onChange={e => handleChange('startTime', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Heure fin:</label>
            <input
              type="time"
              value={reservation.endTime}
              onChange={e => handleChange('endTime', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Objet:</label>
            <input
              type="text"
              value={reservation.subject}
              onChange={e => handleChange('subject', e.target.value)}
              required
            />
          </div>
          <fieldset>
            <legend>Organisateur</legend>
            <div>
              <label>Nom:</label>
              <input
                type="text"
                value={reservation.organizer?.name || ''}
                onChange={e => handleChange('organizer', { ...reservation.organizer, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={reservation.organizer?.email || ''}
                onChange={e => handleChange('organizer', { ...reservation.organizer, email: e.target.value })}
                required
              />
            </div>
          </fieldset>
          <div>
            <label>Type de réservation:</label>
            <select
              value={reservation.reservationType || 'presentiel'}
              onChange={e => handleChange('reservationType', e.target.value)}
            >
              <option value="presentiel">Présentiel</option>
              <option value="hybride">Hybride</option>
            </select>
          </div>
          <div>
            <label>Équipement:</label>
            <input
              type="text"
              value={reservation.equipment || ''}
              onChange={e => handleChange('equipment', e.target.value)}
            />
          </div>
          <div>
            <label>Disposition:</label>
            <select
              value={reservation.disposition || 'en U'}
              onChange={e => handleChange('disposition', e.target.value)}
            >
              <option value="en U">En U</option>
              <option value="theatral">Théâtral</option>
              <option value="Ronde">Ronde</option>
            </select>
          </div>
          <div>
            <label>Nombre de participants:</label>
            <input
              type="number"
              min="0"
              value={reservation.participantsCount || 0}
              onChange={e => handleChange('participantsCount', parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <label>Département:</label>
            <input
              type="text"
              value={reservation.departement || ''}
              onChange={e => handleChange('departement', e.target.value)}
            />
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
          {recurrenceEnabled && (
            <RecurrenceOptions recurrenceRule={recurrenceRule} setRecurrenceRule={setRecurrenceRule} />
          )}
          {error && <p style={{ color: 'red', marginTop: '1rem', marginBottom: '0.5rem' }}>{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Envoi...' : id ? 'Mettre à jour la réservation' : 'Créer la réservation'}
          </button>
          {id && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                style={{ marginLeft: '1rem', backgroundColor: 'red', color: 'white' }}
              >
                Annuler la réservation
              </button>
              <button
                type="button"
                onClick={handleCancelSeries}
                style={{ marginLeft: '1rem', backgroundColor: 'darkred', color: 'white' }}
                title="Annuler toute la série de réservations"
              >
                Annuler la série
              </button>
            </>
          )}
        </form>
      </main>
      <footer style={{ backgroundColor: '#004080', padding: '1rem', color: 'white', marginTop: '2rem', textAlign: 'center' }}>
        &copy; 2024 Economic Development Board Madagascar
      </footer>
    </>
  );
}
