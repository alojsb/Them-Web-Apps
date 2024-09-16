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

  const clearForm = () => {
    setSelectedBookId('');
    setSelectedUserId('');
    setQuantityChange(1);
    setCurrentStock('-');
    setNumberOfRentedOutBooks('');
    setErrorMessage('');
    setSuccessMessage('');
  };

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
        // Log reservations to check if they are correctly fetched
        console.log('Fetched reservations:', reservationsList);

        setReservations(reservationsList);
      }
    } catch (error) {
      console.error('Error finding reservations:', error.message);
    }
  };

  const handleSelectReservation = (reservationId) => {
    setSelectedReservationId(reservationId);
    // Log the selected reservationId to check if it's set correctly
    console.log('Selected reservationId:', reservationId);

    setSuccessMessage('Reservation selected.');
  };

  const handleSubmit = async (action) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedBookId || !selectedUserId) {
      setErrorMessage('Please select both a book and a user.');
      return;
    }

    const userRef = doc(firestore, 'users', selectedUserId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Ensure currentlyReservedBooks and currentlyRentedBooks are arrays
    const reservedBooks = Array.isArray(userData.currentlyReservedBooks)
      ? userData.currentlyReservedBooks
      : [];
    const rentedBooks = Array.isArray(userData.currentlyRentedBooks)
      ? userData.currentlyRentedBooks
      : [];

    const bookRef = doc(firestore, 'books', selectedBookId);
    const bookDoc = await getDoc(bookRef);
    if (!bookDoc.exists()) {
      setErrorMessage('Book not found!');
      return;
    }

    const currentStock = bookDoc.data().currentStock;
    const currentNumberOfRentedOutBooks =
      bookDoc.data().numberOfRentedOutBooks || 0;
    const numberOfReservedBooks = bookDoc.data().numberOfReservedBooks || 0;

    // Check if renting is based on a reservation
    if (action === 'rent') {
      if (selectedReservationId) {
        // Rental is based on a reservation
        console.log(
          'Processing rental for reservation:',
          selectedReservationId
        );

        // Fulfill reservation and proceed without blocking
        const reservationRef = doc(
          firestore,
          'reservations',
          selectedReservationId
        );
        await updateDoc(reservationRef, { status: 'fulfilled' });

        // Update user's reserved and rented books
        const updatedReservedBooks = reservedBooks.filter(
          (id) => id !== selectedBookId
        );
        const updatedRentedBooks = [...rentedBooks, selectedBookId];

        await updateDoc(userRef, {
          currentlyReservedBooks: updatedReservedBooks,
          currentlyRentedBooks: updatedRentedBooks,
        });

        // Update book's rented out count
        await updateDoc(bookRef, {
          numberOfRentedOutBooks: currentNumberOfRentedOutBooks + 1,
          numberOfReservedBooks: numberOfReservedBooks - 1,
        });

        setSuccessMessage('Book rented successfully from reservation!');
      } else {
        // Rental without a reservation
        console.log('No reservation selected, proceeding with direct rental.');

        // Now perform the total count check
        if (reservedBooks.length + rentedBooks.length >= 3) {
          setErrorMessage(
            'The user cannot have more than 3 books reserved or rented.'
          );
          return;
        }

        // Proceed with the rental
        const updatedRentedBooks = [...rentedBooks, selectedBookId];
        await updateDoc(userRef, { currentlyRentedBooks: updatedRentedBooks });

        // Decrease currentStock and update rented-out count
        await updateDoc(bookRef, {
          currentStock: currentStock - 1,
          numberOfRentedOutBooks: currentNumberOfRentedOutBooks + 1,
        });

        setSuccessMessage('Book rented successfully!');
      }
    }

    clearForm();
    fetchData();
  };

  const isOverdue = (transactionDate) => {
    const currentDate = new Date();
    const rentalDate = new Date(transactionDate.seconds * 1000); // Firestore timestamps are in seconds
    const diffInDays = Math.floor(
      (currentDate - rentalDate) / (1000 * 60 * 60 * 24)
    );
    return diffInDays > 30;
  };

  const handleFilterChange = (e) => {
    setFilterField(e.target.name);
    setFilterValue(e.target.value);

    const filtered = transactions.filter((transaction) =>
      transaction[e.target.name]
        .toLowerCase()
        .includes(e.target.value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(order);

    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      }
      return a[field] < b[field] ? 1 : -1;
    });
    setFilteredTransactions(sortedTransactions);
  };

  if (loading || !userRole) {
    return <p>Loading...</p>;
  }

  return (
    <div className='rental-form'>
      <h2 className='rental-header'>Manage Rentals</h2>

      {/* Rental Management Container */}
      <div className='rental-management'>
        {/* Left: User and Book Selection */}
        <div className='rental-management-left'>
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

        {/* Right: Stock Info and Quantity */}
        <div className='rental-management-right'>
          <div className='book-stock-info'>
            <p>
              <strong>Current Stock:</strong> {currentStock}
            </p>
          </div>

          <div className='rental-inputs'>
            <div className='rental-inputs-left'>
              <label htmlFor='quantityChange'>Quantity:</label>
            </div>
            <div className='rental-inputs-right'>
              <input
                type='number'
                id='quantityChange'
                value={quantityChange}
                onChange={(e) => {
                  setQuantityChange(1);
                  handleInputChange();
                }}
                min={1}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {!errorMessage && !successMessage && (
        <p className='placeholder-message'>.</p>
      )}
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
      {successMessage && <p className='success-message'>{successMessage}</p>}

      {/* Find Reservations Button */}
      <div className='rental-management-button'>
        <button
          type='button'
          className='button find-reservations-btn'
          onClick={handleFindReservations}
        >
          Find Reservations
        </button>
      </div>

      {/* Reservation List */}
      {reservations.length > 0 && (
        <div className='reservation-list'>
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

      {/* Submit Buttons */}
      <div className='rental-buttons'>
        <button
          className='button rent-btn'
          type='button'
          onClick={() => handleSubmit('rent')}
        >
          Rent
        </button>
        <button
          className='button return-btn'
          type='button'
          onClick={() => handleSubmit('return')}
        >
          Return
        </button>
        <button className='clear-btn-rental' type='button' onClick={clearForm}>
          Clear
        </button>
      </div>

      {/* Transaction Overview */}
      <h3 className='transaction-header'>Rental Transactions</h3>
      <div className='filters'>
        <label htmlFor='filterField'>Filter by:</label>
        <input
          type='text'
          name='bookTitle'
          placeholder='Book Title'
          value={filterField === 'bookTitle' ? filterValue : ''}
          onChange={handleFilterChange}
        />
        <input
          type='text'
          name='transactionBy'
          placeholder='Transaction By'
          value={filterField === 'transactionBy' ? filterValue : ''}
          onChange={handleFilterChange}
        />
      </div>

      <table className='transaction-table'>
        <thead>
          <tr>
            <th onClick={() => handleSort('bookTitle')}>Book Title</th>
            <th onClick={() => handleSort('transactionBy')}>Transaction By</th>
            <th onClick={() => handleSort('quantityChange')}>
              Quantity Change
            </th>
            <th onClick={() => handleSort('currentStock')}>Current Stock</th>
            <th onClick={() => handleSort('transactionDate')}>
              Transaction Date
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr
              key={transaction.id}
              className={
                isOverdue(transaction.transactionDate) ? 'overdue' : ''
              }
            >
              <td>{transaction.bookTitle}</td>
              <td>{transaction.transactionBy}</td>
              <td>{transaction.quantityChange}</td>
              <td>{transaction.currentStock}</td>
              <td>
                {transaction.transactionDate &&
                  new Date(
                    transaction.transactionDate.seconds * 1000
                  ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Rental;
