import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';

export default function EditReservation() {
  const router = useRouter();
  const { id } = router.query;

  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8080/api/reservations/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Erreur lors du chargement de la réservation');
        }
        return res.json();
      })
      .then(data => setReservation(data))
      .catch(err => setError(err.message));
  }, [id]);

  const handleChange = (field, value) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...reservation.participants];
    newParticipants[index][field] = value;
    setReservation(prev => ({ ...prev, participants: newParticipants }));
  };

  const addParticipant = () => {
    setReservation(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', email: '' }],
    }));
  };

  const removeParticipant = (index) => {
    const newParticipants = reservation.participants.filter((_, i) => i !== index);
    setReservation(prev => ({ ...prev, participants: newParticipants }));
  };

  const validateForm = () => {
    if (new Date(`1970-01-01T${reservation.endTime}`) <= new Date(`1970-01-01T${reservation.startTime}`)) {
      setError('L\'heure de fin doit être après l\'heure de début.');
      return false;
    }
    // Remove participants validation since replaced by participantsCount
    if (reservation.participantsCount == null || isNaN(reservation.participantsCount)) {
      setError('Le nombre de participants est invalide ou manquant.');
      return false;
    }
    if (reservation.participantsCount < 0) {
      setError('Le nombre de participants ne peut pas être négatif.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:8080/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data || 'Erreur lors de la mise à jour de la réservation');
      }
      router.push('/reservations');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Confirmez-vous l\'annulation de cette réservation ?')) return;
    try {
      // Instead of DELETE, update status to CANCELLED
      const updatedReservation = { ...reservation, status: 'CANCELLED' };
      const res = await fetch(`http://localhost:8080/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReservation),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data || 'Erreur lors de l\'annulation de la réservation');
      }
      router.push('/reservations');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!reservation) return <p>Chargement...</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h1>Modifier la réservation</h1>
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
            <select value={reservation.reservationType || 'presentiel'} onChange={e => handleChange('reservationType', e.target.value)}>
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
            <select value={reservation.disposition || 'en U'} onChange={e => handleChange('disposition', e.target.value)}>
              <option value="en U">En U</option>
              <option value="theatral">Théâtral</option>
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
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? 'Envoi...' : 'Mettre à jour la réservation'}</button>
          <button type="button" onClick={handleCancel} style={{ marginLeft: '1rem', backgroundColor: 'red', color: 'white' }}>
            Annuler la réservation
          </button>
        </form>
      </main>
    </>
  );
}
