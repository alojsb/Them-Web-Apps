import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './BookDetail.css';

const BookDetail = () => {
  const { currentUser } = useAuth();
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useAuth();
  const [reservationError, setReservationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookRef = doc(firestore, 'books', bookId);
        const bookSnap = await getDoc(bookRef);

        if (bookSnap.exists()) {
          setBook(bookSnap.data());
        } else {
          setError('Book not found');
          navigate('/not-found');
        }
      } catch (err) {
        setError('An error occurred while fetching the book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleReserveBook = async () => {
    try {
      setReservationError('');
      setSuccessMessage('');

      if (!currentUser) {
        setReservationError('You must be logged in to reserve a book.');
        return;
      }

      if (book.currentStock === 0) {
        setReservationError(
          'This book is currently out of stock and cannot be reserved.'
        );
        return;
      }

      const userRef = doc(firestore, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      // Check if user already reserved or rented the book
      if (
        userData.currentlyReservedBooks?.includes(bookId) ||
        userData.currentlyRentedBooks?.includes(bookId)
      ) {
        setReservationError('You have already reserved or rented this book.');
        return;
      }

      // Chech if the user already has in total 3 reservations or rentals
      if (
        userData.currentlyReservedBooks.length +
          userData.currentlyRentedBooks.length >=
        3
      ) {
        setReservationError(
          'You cannot have more than 3 books reserved or rented.'
        );
        return;
      }

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // Reservation valid for 7 days

      // Create a reservation
      await addDoc(collection(firestore, 'reservations'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        bookId: bookId,
        bookTitle: book.title,
        reservationDate: new Date(),
        expirationDate,
        status: 'active',
      });

      // Update user's reserved books array
      await updateDoc(userRef, {
        currentlyReservedBooks: [
          ...(userData.currentlyReservedBooks || []),
          bookId,
        ],
      });

      // Update book's stock
      const bookRef = doc(firestore, 'books', bookId);
      await updateDoc(bookRef, {
        currentStock: book.currentStock - 1,
        numberOfReservedBooks: book.numberOfReservedBooks + 1,
      });

      setSuccessMessage('Book reserved successfully!');
    } catch (error) {
      setReservationError('Error reserving book: ' + error.message);
    }
  };

  // Remaining delete logic...

  const handleBackClick = () => {
    navigate('/books');
  };

  const handleEditClick = () => {
    navigate(`/edit-book/${bookId}`);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='book-detail'>
      <h2>Book Details</h2>

      {book && (
        <div className='book-details-container'>
          {book.coverImageURL && (
            <div className='book-cover'>
              <div className='stock-display-container'>
                In stock:{' '}
                <span>
                  {book.currentStock !== null
                    ? book.currentStock
                    : 'Loading...'}
                </span>{' '}
                of{' '}
                <span>
                  {book.totalNumber !== null ? book.totalNumber : 'Loading...'}
                </span>
              </div>
              <div>
                <img src={book.coverImageURL} alt={`${book.title} cover`} />
              </div>
            </div>
          )}
          <div className='book-info'>
            <div className='stock-display-container invisible'></div>
            <h3>{book.title}</h3>

            <div className='book-info-item'>
              <div className='field-name-container'>
                <div className='field-name item'>Author</div>
                <div className='field-name item'>Year</div>
                <div className='field-name item'>ISBN</div>
                <div className='field-name item'>Script</div>
                <div className='field-name item'>Language</div>
                <div className='field-name item'>Genre</div>
              </div>
              <div className='field-value-container'>
                <div className='field-value item'>{book.author}</div>
                <div className='field-value item'>{book.year}</div>
                <div className='field-value item'>{book.isbn}</div>
                <div className='field-value item'>{book.script}</div>
                <div className='field-value item'>{book.language}</div>
                <div className='field-value item'>{book.genre}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className='book-detail-buttons'>
        {userRole === 'admin' && (
          <>
            <button className='button edit-button' onClick={handleEditClick}>
              Edit
            </button>
          </>
        )}
        <button className='button back-button' onClick={handleBackClick}>
          Back
        </button>
        <button className='button reserve-button' onClick={handleReserveBook}>
          Reserve
        </button>
        {reservationError && (
          <p className='error-message'>{reservationError}</p>
        )}
        {successMessage && <p className='success-message'>{successMessage}</p>}
      </div>
      {userRole === 'admin' && (
        <div className='admin-fields'>
          <p>
            <strong>Created At:</strong>{' '}
            {book.createdAt?.toDate().toLocaleString()}
          </p>
          <p>
            <strong>Created By:</strong> {book.createdBy}
          </p>
          <p>
            <strong>Updated At:</strong>{' '}
            {book.updatedAt?.toDate().toLocaleString()}
          </p>
          <p>
            <strong>Updated By:</strong> {book.updatedBy}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
