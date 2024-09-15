// hooks/useReservations.js
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';

const useReservations = (userId = null) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setErrorMessage('');
        setLoading(true);

        const conditions = userId ? [where('userId', '==', userId)] : [];
        const reservationsQuery = query(
          collection(firestore, 'reservations'),
          ...conditions
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

    fetchReservations();
  }, [userId]);

  return { reservations, loading, errorMessage };
};

export default useReservations;
