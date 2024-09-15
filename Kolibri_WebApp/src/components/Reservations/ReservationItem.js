// components/ReservationItem.js
import React from 'react';

const ReservationItem = ({
  reservation,
  currentUser,
  handleCancelReservation,
}) => {
  return (
    <li key={reservation.id} className='reservation-item'>
      <p>
        <strong>{reservation.bookTitle}</strong> - Status: {reservation.status}
        <br />
        Reserved by: {reservation.userEmail || currentUser?.email}
        <br />
        Reserved on:{' '}
        {reservation.reservationDate?.toDate()
          ? new Date(reservation.reservationDate.toDate()).toLocaleDateString()
          : 'N/A'}
        <br />
        {reservation.status === 'expired' ||
        reservation.status === 'fulfilled' ? (
          <>
            Expired on:{' '}
            {reservation.expirationDate?.toDate()
              ? new Date(
                  reservation.expirationDate.toDate()
                ).toLocaleDateString()
              : 'N/A'}
          </>
        ) : (
          <>
            Expires on:{' '}
            {reservation.expirationDate?.toDate()
              ? new Date(
                  reservation.expirationDate.toDate()
                ).toLocaleDateString()
              : 'N/A'}
          </>
        )}
      </p>
      <button
        onClick={() => handleCancelReservation(reservation.id)}
        disabled={reservation.status !== 'active'}
      >
        Cancel
      </button>
    </li>
  );
};

export default ReservationItem;
