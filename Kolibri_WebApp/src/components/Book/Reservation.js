import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './Reservation.css';

const Reservation = () => {
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

          // Handle expired reservations
          if (
            reservation.status === 'active' &&
            expirationDate &&
            expirationDate <= currentDate
          ) {
            // Mark reservation as expired
            await updateDoc(reservationDocRef, { status: 'expired' });

            // Increase book's current stock by 1
            const bookDocRef = doc(firestore, 'books', reservation.bookId);
            const bookDocSnap = await getDoc(bookDocRef);
            if (bookDocSnap.exists()) {
              const currentStock = bookDocSnap.data().currentStock;
              await updateDoc(bookDocRef, { currentStock: currentStock + 1 });
            }

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

      // Fetch the reservation document to get bookId
      const reservationDocSnap = await getDoc(reservationDocRef);
      if (!reservationDocSnap.exists()) {
        setErrorMessage('Reservation not found!');
        return;
      }

      const { bookId } = reservationDocSnap.data();

      // Update the reservation status to 'cancelled'
      await updateDoc(reservationDocRef, { status: 'cancelled' });

      // Increase the currentStock by 1 in the book document
      const bookDocRef = doc(firestore, 'books', bookId);
      const bookDocSnap = await getDoc(bookDocRef);
      if (bookDocSnap.exists()) {
        const currentStock = bookDocSnap.data().currentStock;
        const numberOfReservedBooks = bookDocSnap.data().numberOfReservedBooks;
        await updateDoc(bookDocRef, {
          currentStock: currentStock + 1,
          numberOfReservedBooks: numberOfReservedBooks - 1,
        });
      }

      // Fetch and update the user's currentlyReservedBooks array
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const currentlyReservedBooks =
          userDocSnap.data().currentlyReservedBooks || [];

        // Remove the bookId from the currentlyReservedBooks array
        const updatedCurrentlyReservedBooks = currentlyReservedBooks.filter(
          (id) => id !== bookId
        );

        await updateDoc(userDocRef, {
          currentlyReservedBooks: updatedCurrentlyReservedBooks,
        });
      }

      // Update the local state to reflect the canceled reservation
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

export default Reservation;
