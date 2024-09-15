import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  where,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Rental.css';

const Rental = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quantityChange, setQuantityChange] = useState(1);
  const [currentStock, setCurrentStock] = useState('-');
  const [reservations, setReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState(null); // Store selected reservation
  const [numberOfRentedOutBooks, setNumberOfRentedOutBooks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const handleInputChange = () => setErrorMessage('');

  const fetchData = async () => {
    try {
      // Fetch books
      const booksCollection = collection(firestore, 'books');
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));
      setBooks(booksList);

      // Fetch users
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
      }));
      setUsers(usersList);

      // Fetch transactions
      const transactionsQuery = query(
        collection(firestore, 'rentalTransactions'),
        orderBy('transactionDate', 'desc')
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsList = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsList);
      setFilteredTransactions(transactionsList);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setErrorMessage('Failed to load data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/');
    }
    fetchData();
  }, [userRole, navigate]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!selectedBookId) {
        setCurrentStock('-');
        setSelectedBookTitle('');
        return;
      }

      try {
        const bookDocRef = doc(firestore, 'books', selectedBookId);
        const bookDoc = await getDoc(bookDocRef);
        if (bookDoc.exists()) {
          setCurrentStock(bookDoc.data().currentStock);
          setSelectedBookTitle(bookDoc.data().title);
          setNumberOfRentedOutBooks(bookDoc.data().numberOfRentedOutBooks || 0);
        }
      } catch (error) {
        console.error('Error fetching book details:', error.message);
      }
    };

    fetchBookDetails();
  }, [selectedBookId]);

  // Find reservations for selected user and book
  const handleFindReservations = async () => {
    if (!selectedUserId || !selectedBookId) {
      setErrorMessage('Please select both a book and a user.');
      return;
    }

    try {
      const reservationsQuery = query(
        collection(firestore, 'reservations'),
        where('userId', '==', selectedUserId),
        where('bookId', '==', selectedBookId),
        where('status', '==', 'active')
      );
      const reservationsSnapshot = await getDocs(reservationsQuery);

      if (reservationsSnapshot.empty) {
        setErrorMessage('No active reservations found for this user and book.');
        setReservations([]);
      } else {
        const reservationsList = reservationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReservations(reservationsList);
      }
    } catch (error) {
      console.error('Error finding reservations:', error.message);
    }
  };

  const handleSelectReservation = (reservationId) => {
    setSelectedReservationId(reservationId);
    setSuccessMessage('Reservation selected.');
  };

  const clearForm = () => {
    setSelectedBookId(''); // Reset selected book
    setSelectedUserId('');
    setQuantityChange(1); // Reset quantity to 1 (default)
    setCurrentStock('-'); // Reset the current stock display
    setNumberOfRentedOutBooks(''); // Reset rented out books count
    setErrorMessage(''); // Clear any error messages
    setSuccessMessage(''); // Clear any success messages
  };

  const handleSubmit = async (action) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedBookId || !selectedUserId) {
      setErrorMessage(
        'Please select both a book and a user before submitting.'
      );
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be logged in to submit a transaction.');
      return;
    }

    const confirmSubmit = window.confirm(
      `Are you sure you want to ${
        action === 'rent' ? 'rent' : 'return'
      } this book?`
    );
    if (!confirmSubmit) return;

    try {
      const bookDocRef = doc(firestore, 'books', selectedBookId);
      const bookDoc = await getDoc(bookDocRef);

      if (!bookDoc.exists()) {
        setErrorMessage('Book not found!');
        return;
      }

      const currentCurrentStock = bookDoc.data().currentStock;
      const currentNumberOfRentedOutBooks =
        bookDoc.data().numberOfRentedOutBooks || 0;

      // Fetch selected user's email based on selectedUserId
      const userDocRef = doc(firestore, 'users', selectedUserId);
      const userDoc = await getDoc(userDocRef);
      const selectedUserEmail = userDoc.data().email;

      // Check if the user has already rented this book
      const rentalQuery = query(
        collection(firestore, 'rentalTransactions'),
        where('renteeEmail', '==', selectedUserEmail),
        where('bookId', '==', selectedBookId),
        where('status', '==', 'active')
      );
      const rentalSnapshot = await getDocs(rentalQuery);

      if (!rentalSnapshot.empty && action === 'rent') {
        setErrorMessage(
          'You have already rented this book and it is still active.'
        );
        return;
      }

      // Prevent returning more than rented-out books
      if (action === 'return') {
        if (currentNumberOfRentedOutBooks === 0) {
          setErrorMessage('No books are currently rented out to be returned.');
          return;
        }
      }

      // Prevent renting if the stock is 0
      if (action === 'rent' && currentCurrentStock <= 0) {
        setErrorMessage('Not enough stock available for rent.');
        return;
      }

      // Check if the user has an active reservation for this book
      const reservationsQuery = query(
        collection(firestore, 'reservations'),
        where('userId', '==', selectedUserId),
        where('bookId', '==', selectedBookId),
        where('status', '==', 'active')
      );
      const reservationsSnapshot = await getDocs(reservationsQuery);
      let reservationId = null;
      let reservationExists = false;

      if (!reservationsSnapshot.empty) {
        const reservation = reservationsSnapshot.docs[0]; // Assuming one reservation per user per book
        reservationId = reservation.id;
        reservationExists = true;

        // Update the reservation status to 'fulfilled'
        const reservationDocRef = doc(firestore, 'reservations', reservationId);

        // Here is where we need to ensure the status gets updated
        await updateDoc(reservationDocRef, { status: 'fulfilled' });
      }

      // Update the stock and rented-out values accordingly
      const newCurrentStock =
        action === 'rent' ? currentCurrentStock - 1 : currentCurrentStock + 1;
      const newNumberOfRentedOutBooks =
        action === 'rent'
          ? currentNumberOfRentedOutBooks + 1
          : currentNumberOfRentedOutBooks - 1;

      if (newNumberOfRentedOutBooks < 0) {
        setErrorMessage('Cannot return more books than are rented out.');
        return;
      }

      let rentalTransactionId = null;

      if (action === 'return') {
        if (rentalSnapshot.empty) {
          setErrorMessage('No active rental found for this book.');
          return;
        }

        const rentalDoc = rentalSnapshot.docs[0];
        rentalTransactionId = rentalDoc.id;

        // Update the existing rental to mark it as returned
        await updateDoc(
          doc(firestore, 'rentalTransactions', rentalTransactionId),
          {
            status: 'returned',
            returnedDate: new Date(),
          }
        );
      } else {
        // Create a new rental transaction
        const rentalTransaction = {
          bookId: selectedBookId,
          userId: selectedUserId,
          bookTitle: selectedBookTitle,
          transactionBy: currentUser.email,
          status: 'active', // Set status to active for rentals
          rentedDate: new Date(),
          renteeEmail: selectedUserEmail,
        };

        const rentalTransactionDocRef = await addDoc(
          collection(firestore, 'rentalTransactions'),
          rentalTransaction
        );

        rentalTransactionId = rentalTransactionDocRef.id;
      }

      await updateDoc(bookDocRef, {
        currentStock: newCurrentStock,
        numberOfRentedOutBooks: newNumberOfRentedOutBooks,
      });

      const oldCurrentlyRentedBooks = userDoc.data().currentlyRentedBooks || 0;
      const oldCurrentlyReservedBooks =
        userDoc.data().currentlyReservedBooks || 0;

      // Update the user's currentlyRentedBooks
      const updates = {
        currentlyRentedBooks:
          action === 'rent'
            ? oldCurrentlyRentedBooks + 1
            : oldCurrentlyRentedBooks - 1,
      };

      // Only update currentlyReservedBooks if the rental was based on a reservation
      if (reservationExists) {
        updates.currentlyReservedBooks = oldCurrentlyReservedBooks - 1;
      }

      await updateDoc(userDocRef, updates);

      setSuccessMessage(
        `Book ${action === 'rent' ? 'rented' : 'returned'} successfully!`
      );
      clearForm();
      fetchData(); // Refresh data after submitting a transaction
    } catch (error) {
      setErrorMessage('Error processing transaction: ' + error.message);
    }
  };

  return (
    <div className='rental-form'>
      <h2 className='rental-header'>Manage Rentals</h2>

      {/* User Dropdown */}
      <div className='rental-controls'>
        <label htmlFor='userId'>User:</label>
        <select
          id='userId'
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
            handleInputChange();
          }}
        >
          <option value='' disabled>
            Select a user
          </option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {/* Book Dropdown */}
      <div className='rental-controls'>
        <label htmlFor='bookId'>Book:</label>
        <select
          id='bookId'
          value={selectedBookId}
          onChange={(e) => {
            setSelectedBookId(e.target.value);
            handleInputChange();
          }}
        >
          <option value='' disabled>
            Select a book
          </option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
      </div>

      {/* Find Reservations Button */}
      <button type='button' onClick={handleFindReservations}>
        Find Reservations
      </button>

      {/* Reservation List */}
      {reservations.length > 0 && (
        <div className='reservation-list'>
          <h3>Select Reservation</h3>
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className={`reservation-item ${
                selectedReservationId === reservation.id ? 'selected' : ''
              }`}
              onClick={() => handleSelectReservation(reservation.id)}
            >
              <p>
                {reservation.bookTitle} - Reserved by {reservation.userId}
              </p>
              <p>
                Reservation Date:{' '}
                {reservation.reservationDate?.toDate().toLocaleDateString()}
              </p>
              <p>
                Expires on:{' '}
                {reservation.expirationDate?.toDate().toLocaleDateString()}
              </p>
              <p>Status: {reservation.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* Book Stock Info */}
      <div className='book-stock-info'>
        <p>
          <strong>Current Stock:</strong> {currentStock}
        </p>
      </div>

      {/* Quantity Input */}
      <div className='rental-inputs'>
        <label htmlFor='quantityChange'>Quantity:</label>
        <input
          type='number'
          id='quantityChange'
          value={quantityChange}
          onChange={(e) => {
            setQuantityChange(1); // Automatically set quantity to 1
            handleInputChange();
          }}
          min={1}
          disabled // Disable the input
        />
      </div>

      {/* Submit Buttons */}
      <div className='rental-buttons'>
        <button
          className='rent-btn'
          type='button'
          onClick={() => handleSubmit('rent')}
        >
          Rent
        </button>
        <button
          className='return-btn'
          type='button'
          onClick={() => handleSubmit('return')}
        >
          Return
        </button>
      </div>

      {/* Error and Success Messages */}
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
      {successMessage && <p className='success-message'>{successMessage}</p>}
    </div>
  );
};

export default Rental;
