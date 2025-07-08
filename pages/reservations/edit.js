import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditReservation({ id }) {
  const router = useRouter();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // New states for reservationType, equipment, disposition, participantsCount
  const [reservationType, setReservationType] = useState('presentiel');
  const [equipment, setEquipment] = useState('');
  const [disposition, setDisposition] = useState('en U');
  const [participantsCount, setParticipantsCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        setReservation(data);
        setReservationType(data.reservationType || 'presentiel');
        setEquipment(data.equipment || '');
        setDisposition(data.disposition || 'en U');
        setParticipantsCount(data.participantsCount || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Erreur lors du chargement de la réservation');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (field, value) => {
    setReservation(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (new Date(`1970-01-01T${reservation.endTime}`) <= new Date(`1970-01-01T${reservation.startTime}`)) {
      setError('L\'heure de fin doit être après l\'heure de début.');
      return false;
    }
    // No participants validation needed
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const updatedReservation = {
      ...reservation,
      reservationType,
      equipment,
      disposition,
      participantsCount,
    };

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReservation),
      });
      if (!res.ok) {
        let errorMessage = 'Erreur lors de la mise à jour de la réservation';
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
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!reservation) return null;

  return (
    <>
      <header style={{ backgroundColor: '#004080', padding: '1rem', color: 'white' }}>
        <h1>Modifier la réservation</h1>
        <nav>
          <Link href="/">Accueil</Link> | <Link href="/reservations">Liste des réservations</Link>
        </nav>
      </header>
      <main style={{ padding: '2rem' }}>
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
                value={reservation.organizer.name}
                onChange={e => handleChange('organizer', { ...reservation.organizer, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                value={reservation.organizer.email}
                onChange={e => handleChange('organizer', { ...reservation.organizer, email: e.target.value })}
                required
              />
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
          <button type="submit">Enregistrer</button>
        </form>
      </main>
      <footer style={{ backgroundColor: '#004080', padding: '1rem', color: 'white', marginTop: '2rem', textAlign: 'center' }}>
        &copy; 2024 Economic Development Board Madagascar
      </footer>
    </>
  );
}
