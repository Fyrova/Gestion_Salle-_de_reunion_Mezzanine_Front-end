import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reservations from '../pages/reservations/index';
import CreateReservation from '../pages/reservations/create';
import EditReservation from '../pages/reservations/edit';

global.fetch = jest.fn();

describe('Reservations Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders reservations list and filters by status and date', async () => {
    const mockReservations = [
      { id: 1, date: '2024-06-01', startTime: '09:00', endTime: '10:00', subject: 'Meeting 1', organizer: { name: 'Alice' }, status: 'CONFIRMED' },
      { id: 2, date: '2024-06-02', startTime: '11:00', endTime: '12:00', subject: 'Meeting 2', organizer: { name: 'Bob' }, status: 'CANCELLED' },
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

    // Filter by CONFIRMED
    fireEvent.change(screen.getByLabelText(/Filtrer par statut/i), { target: { value: 'CONFIRMED' } });
    expect(screen.getByText('Meeting 1')).toBeInTheDocument();
    expect(screen.queryByText('Meeting 2')).toBeNull();
  });
});

describe('CreateReservation Page', () => {
  test('submits form successfully', async () => {
    fetch.mockResolvedValueOnce({ ok: true });

    render(<CreateReservation />);

    fireEvent.change(screen.getByLabelText(/Date:/i), { target: { value: '2024-06-10' } });
    fireEvent.change(screen.getByLabelText(/Heure début:/i), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText(/Heure fin:/i), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText(/Objet:/i), { target: { value: 'Test Meeting' } });
    fireEvent.change(screen.getByLabelText(/Nom:/i), { target: { value: 'Test Organizer' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'organizer@example.com' } });

    fireEvent.click(screen.getByText(/Créer la réservation/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});

describe('EditReservation Page', () => {
  test('loads reservation and cancels with confirmation', async () => {
    const mockReservation = {
      id: 1,
      date: '2024-06-10',
      startTime: '09:00',
      endTime: '10:00',
      subject: 'Test Meeting',
      organizer: { name: 'Test Organizer', email: 'organizer@example.com' },
      participants: [{ name: 'Participant 1', email: 'participant1@example.com' }],
      status: 'CONFIRMED',
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservation,
    });

    window.confirm = jest.fn(() => true);
    fetch.mockResolvedValueOnce({ ok: true });

    render(<EditReservation />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Meeting')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Annuler la réservation/i));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
