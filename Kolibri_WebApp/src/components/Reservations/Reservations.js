// components/Reservations.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useReservations from '../../hooks/useReservations.js';
import ReservationItem from './ReservationItem';
import './Reservations.css';

const Reservations = () => {
  const { currentUser } = useAuth();
  const { reservations, loading, errorMessage } = useReservations(
    currentUser.uid
  );

  const handleCancelReservation = async (reservationId) => {
    // Same cancellation logic as before
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p className='error-message'>{errorMessage}</p>;
  }

  return (
    <div className='reservations-list'>
      <h2>Your Reservations</h2>
      {reservations.length === 0 ? (
        <p>You have no reservations.</p>
      ) : (
        <ul>
          {reservations.map((reservation) => (
            <ReservationItem
              key={reservation.id}
              reservation={reservation}
              currentUser={currentUser}
              handleCancelReservation={handleCancelReservation}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reservations;
