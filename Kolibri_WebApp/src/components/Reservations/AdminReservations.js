// components/AdminReservations.js
import React, { useState } from 'react';
import useReservations from '../../hooks/useReservations';
import ReservationItem from './ReservationItem';
import './Reservations.css';

const AdminReservations = () => {
  const { reservations, loading, errorMessage } = useReservations(); // Fetch all reservations
  const [filter, setFilter] = useState('');

  const handleCancelReservation = async (reservationId) => {
    // Same cancellation logic as before
  };

  const filteredReservations = reservations.filter(
    (reservation) =>
      reservation.bookTitle.toLowerCase().includes(filter.toLowerCase()) ||
      reservation.userEmail.toLowerCase().includes(filter.toLowerCase()) ||
      reservation.status.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p className='error-message'>{errorMessage}</p>;
  }

  return (
    <div className='reservations-list'>
      <h2>All Reservations</h2>
      <input
        type='text'
        placeholder='Filter by book title, user, or status'
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filteredReservations.length === 0 ? (
        <p>No reservations found.</p>
      ) : (
        <ul>
          {filteredReservations.map((reservation) => (
            <ReservationItem
              key={reservation.id}
              reservation={reservation}
              handleCancelReservation={handleCancelReservation}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReservations;
