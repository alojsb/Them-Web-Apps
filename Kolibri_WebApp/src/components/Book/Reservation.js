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
import './Reservation.css'; // You can style this component with a CSS file

const Reservations = () => {
  const { currentUser } = useAuth(); // Fetch the current user
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setErrorMessage('');
        setLoading(true);

        // Fetch active reservations for the logged-in user
        const reservationsQuery = query(
          collection(firestore, 'reservations'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'active')
        );
        const reservationsSnapshot = await getDocs(reservationsQuery);

        const reservationsList = reservationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out expired reservations
        const currentDate = new Date();
        const activeReservations = reservationsList.filter(
          (reservation) => reservation.expirationDate.toDate() > currentDate
        );

        // Mark expired reservations as 'expired'
        const expiredReservations = reservationsList.filter(
          (reservation) => reservation.expirationDate.toDate() <= currentDate
        );
        expiredReservations.forEach(async (reservation) => {
          const reservationDocRef = doc(
            firestore,
            'reservations',
            reservation.id
          );
          await updateDoc(reservationDocRef, { status: 'expired' });
        });

        setReservations(activeReservations);
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
        <p>You have no active reservations.</p>
      ) : (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.id} className='reservation-item'>
              <p>
                <strong>{reservation.bookTitle}</strong> (Reservation Expires:{' '}
                {new Date(
                  reservation.expirationDate.toDate()
                ).toLocaleDateString()}
                )
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Reservations;
