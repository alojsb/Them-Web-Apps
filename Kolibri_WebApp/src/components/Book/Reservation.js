import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './Reservation.css';

const Reservations = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setErrorMessage('');
        setLoading(true);

        // Fetch all reservations for the current user, regardless of status
        const reservationsQuery = query(
          collection(firestore, 'reservations'),
          where('userId', '==', currentUser.uid)
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);

        const reservationsList = reservationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentDate = new Date();
        const updatedReservations = [];

        for (const reservation of reservationsList) {
          const reservationDocRef = doc(
            firestore,
            'reservations',
            reservation.id
          );

          const expirationDate = reservation.expirationDate?.toDate();
          if (
            reservation.status === 'active' &&
            expirationDate &&
            expirationDate <= currentDate
          ) {
            // Mark as expired if the reservation has passed its expiration date
            await updateDoc(reservationDocRef, { status: 'expired' });
            updatedReservations.push({ ...reservation, status: 'expired' });
          } else {
            updatedReservations.push(reservation);
          }
        }

        setReservations(updatedReservations);
      } catch (error) {
        setErrorMessage('Failed to load reservations: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchReservations();
    }
  }, [currentUser]);

  const handleCancelReservation = async (reservationId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (!confirmCancel) {
      return;
    }
    try {
      const reservationDocRef = doc(firestore, 'reservations', reservationId);
      await updateDoc(reservationDocRef, {
        status: 'cancelled',
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: 'cancelled' }
            : reservation
        )
      );
    } catch (error) {
      setErrorMessage('Failed to cancel reservation: ' + error.message);
    }
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
            <li key={reservation.id} className='reservation-item'>
              <p>
                <strong>{reservation.bookTitle}</strong> - Status:{' '}
                {reservation.status}
                <br />
                Reserved by: {currentUser.email}
                <br />
                Reserved on:{' '}
                {reservation.reservationDate?.toDate()
                  ? new Date(
                      reservation.reservationDate.toDate()
                    ).toLocaleDateString()
                  : 'N/A'}
                <br />
                Expiration date:{' '}
                {reservation.expirationDate?.toDate()
                  ? new Date(
                      reservation.expirationDate.toDate()
                    ).toLocaleDateString()
                  : 'N/A'}
              </p>
              <button
                onClick={() => handleCancelReservation(reservation.id)}
                disabled={reservation.status !== 'active'}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reservations;
