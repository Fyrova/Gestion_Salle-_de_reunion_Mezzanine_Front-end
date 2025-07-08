import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function CreateReservation() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [subject, setSubject] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [participants, setParticipants] = useState([{ name: '', email: '' }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Remove participants state and handlers since replaced by participantsCount
  // Add new states for reservationType, equipment, disposition, participantsCount
  const [reservationType, setReservationType] = useState('presentiel');
  const [equipment, setEquipment] = useState('');
  const [disposition, setDisposition] = useState('en U');
  const [participantsCount, setParticipantsCount] = useState(0);

  // Remove participant handlers

  const validateForm = () => {
    if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
      setError('L\'heure de fin doit être après l\'heure de début.');
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
      status: 'CONFIRMED',
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
          errorMessage = data.error || JSON.stringify(data);
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
      <header style={{ backgroundColor: '#004080', padding: '1rem', color: 'white' }}>
        <h1>Créer une réservation</h1>
        <nav>
          <Link href="/">Accueil</Link> | <Link href="/reservations">Liste des réservations</Link>
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label>Heure début:</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div>
            <label>Heure fin:</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
          </div>
          <div>
            <label>Objet:</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <fieldset>
            <legend>Organisateur</legend>
            <div>
              <label>Nom:</label>
              <input type="text" value={organizerName} onChange={e => setOrganizerName(e.target.value)} required />
            </div>
            <div>
              <label>Email:</label>
              <input type="email" value={organizerEmail} onChange={e => setOrganizerEmail(e.target.value)} required />
            </div>
          </fieldset>
          <div>
            <label>Type de réservation:</label>
            <select value={reservationType} onChange={e => setReservationType(e.target.value)}>
              <option value="presentiel">Présentiel</option>
              <option value="hybride">Hybride</option>
            </select>
          </div>
          <div>
            <label>Équipement:</label>
            <input type="text" value={equipment} onChange={e => setEquipment(e.target.value)} />
          </div>
          <div>
            <label>Disposition:</label>
            <select value={disposition} onChange={e => setDisposition(e.target.value)}>
              <option value="en U">En U</option>
              <option value="theatral">Théâtral</option>
            </select>
          </div>
          <div>
            <label>Nombre de participants:</label>
            <input type="number" min="0" value={participantsCount} onChange={e => setParticipantsCount(parseInt(e.target.value, 10))} />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Envoi...' : 'Créer la réservation'}</button>
        </form>
      </main>
      <footer style={{ backgroundColor: '#004080', padding: '1rem', color: 'white', marginTop: '2rem', textAlign: 'center' }}>
        &copy; 2024 Economic Development Board Madagascar
      </footer>
    </>
  );
}
