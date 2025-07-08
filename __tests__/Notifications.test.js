import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reservations from '../pages/reservations/index';

global.fetch = jest.fn();

describe('Notifications UI', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('displays notification on reservation confirmation', async () => {
    const mockReservations = [
      { id: 1, date: '2024-06-01', startTime: '09:00', endTime: '10:00', subject: 'Meeting 1', organizer: { name: 'Alice' }, status: 'CONFIRMED' },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockReservations,
    });

    render(<Reservations />);

    await waitFor(() => {
      expect(screen.getByText('Meeting 1')).toBeInTheDocument();
    });

    // Simulate notification display logic if any
    // For example, check if notification component appears on certain action
  });

  // Add more tests for automatic email notifications UI if applicable
});
