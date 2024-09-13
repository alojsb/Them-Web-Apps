import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Rental.css'; // Create a CSS file for this component

const Rental = () => {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quantityChange, setQuantityChange] = useState(1);
  const [currentStock, setCurrentStock] = useState('-');
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

  // Clear error message when the user changes any input field
  const handleInputChange = () => {
    setErrorMessage('');
  };

  // Define fetchData outside of useEffect so it can be reused
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

      // Set loading to false after both fetches are complete
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setErrorMessage('Failed to load data.');
      setLoading(false);
    }
  };

  // Fetch books and transactions when component loads
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
          setNumberOfRentedOutBooks(bookDoc.data().numberOfRentedOutBooks || 0); // Fetch this field
        }
      } catch (error) {
        console.error('Error fetching book details:', error.message);
      }
    };

    fetchBookDetails();
  }, [selectedBookId]);

  const handleSubmit = async (action) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedBookId) {
      setErrorMessage('Please select a book before submitting.');
      return;
    }

    if (!currentUser) {
      setErrorMessage('You must be logged in to submit a transaction.');
      return;
    }

    if (quantityChange <= 0) {
      setErrorMessage('Quantity must be greater than 0.');
      return;
    }

    const userEmail = currentUser.email;

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

      console.log('quantityChange:', quantityChange);
      console.log(
        'currentNumberOfRentedOutBooks:',
        currentNumberOfRentedOutBooks
      );

      // Prevent returning more than rented-out books
      if (action === 'return') {
        if (quantityChange > currentNumberOfRentedOutBooks) {
          setErrorMessage(
            `You cannot return more than ${currentNumberOfRentedOutBooks} books, which are currently rented out.`
          );
          return;
        }
        if (currentNumberOfRentedOutBooks === 0) {
          setErrorMessage('No books are currently rented out to be returned.');
          return;
        }
      }

      // Prevent renting if the quantityChange exceeds available stock
      if (action === 'rent' && quantityChange > currentCurrentStock) {
        setErrorMessage('Not enough stock available for rent.');
        return;
      }

      // Update the stock and rented-out values accordingly
      const newCurrentStock =
        action === 'rent'
          ? currentCurrentStock - quantityChange
          : currentCurrentStock + quantityChange;

      const newNumberOfRentedOutBooks =
        action === 'rent'
          ? currentNumberOfRentedOutBooks + quantityChange
          : currentNumberOfRentedOutBooks - quantityChange;

      if (newNumberOfRentedOutBooks < 0) {
        setErrorMessage('Cannot return more books than rented out.');
        return;
      }

      await addDoc(collection(firestore, 'rentalTransactions'), {
        bookId: selectedBookId,
        bookTitle: selectedBookTitle,
        transactionBy: userEmail,
        quantityChange: action === 'rent' ? -quantityChange : quantityChange,
        transactionDate: new Date(),
        currentStock: newCurrentStock,
      });

      await updateDoc(bookDocRef, {
        currentStock: newCurrentStock,
        numberOfRentedOutBooks: newNumberOfRentedOutBooks,
      });

      setSuccessMessage(
        `Book ${action === 'rent' ? 'rented' : 'returned'} successfully!`
      );
      clearForm();
      fetchData(); // Refresh data after submitting a transaction
    } catch (error) {
      setErrorMessage('Error processing transaction: ' + error.message);
    }
  };

  const clearForm = () => {
    setSelectedBookId('');
    setQuantityChange(1); // Reset quantity change
    setCurrentStock('-');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // ... rest of your component JSX

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

      <div className='book-stock-info'>
        <p>
          <strong>Current Stock:</strong> {currentStock}
        </p>
      </div>

      <div className='rental-inputs'>
        <label htmlFor='quantityChange'>Quantity:</label>
        <input
          type='number'
          id='quantityChange'
          value={quantityChange}
          onChange={(e) => {
            setQuantityChange(parseInt(e.target.value));
            handleInputChange();
          }}
          min={1}
        />
      </div>

      {/* Display error or success message */}
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
      {successMessage && <p className='success-message'>{successMessage}</p>}

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
        <button className='clear-btn' type='button' onClick={clearForm}>
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
            <th onClick={() => handleSort('currentStock')}>Current Stock</th>{' '}
            <th onClick={() => handleSort('transactionDate')}>
              Transaction Date
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id}>
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
