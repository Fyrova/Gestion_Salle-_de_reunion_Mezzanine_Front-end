import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reservations from '../pages/reservations/index';

global.fetch = jest.fn();

describe('Search and Error Handling UI', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('searches reservations by date and organizer', async () => {
    const mockReservations = [
      { id: 1, date: '2024-06-01', startTime: '09:00', endTime: '10:00', subject: 'Meeting 1', organizer: { name: 'Alice', email: 'alice@example.com' }, status: 'CONFIRMED' },
      { id: 2, date: '2024-06-02', startTime: '11:00', endTime: '12:00', subject: 'Meeting 2', organizer: { name: 'Bob', email: 'bob@example.com' }, status: 'CONFIRMED' },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    render(<Reservations />);

    await waitFor(() => {
      expect(screen.getByText('Meeting 1')).toBeInTheDocument();
      expect(screen.getByText('Meeting 2')).toBeInTheDocument();
    });

    // Simulate search by date
    fireEvent.change(screen.getByLabelText(/Date de réservation/i), { target: { value: '2024-06-01' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(screen.getByText('Meeting 1')).toBeInTheDocument();
      expect(screen.queryByText('Meeting 2')).toBeNull();
    });

    // Simulate search by organizer
    fireEvent.change(screen.getByLabelText(/Organisateur/i), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => {
      expect(screen.getByText('Meeting 2')).toBeInTheDocument();
      expect(screen.queryByText('Meeting 1')).toBeNull();
    });
  });

  test('displays error message on fetch failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<Reservations />);

    await waitFor(() => {
      expect(screen.getByText(/Erreur lors du chargement des réservations/i)).toBeInTheDocument();
    });
  });
});
