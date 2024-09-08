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
import { firestore, auth } from '../../firebase/firebaseConfig'; // Import Firebase Authentication
import './Inventory.css';

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [quantityChange, setQuantityChange] = useState(0); // Renamed from numberOfBooks
  const [totalNumber, setTotalNumber] = useState('-'); // Initial value is '-'
  const [currentStock, setCurrentStock] = useState('-'); // Initial value is '-'
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [invoiceOrWriteOff, setInvoiceOrWriteOff] = useState(''); // For storing the invoice/write-off request input
  const [currentUser, setCurrentUser] = useState(null); // Store current user
  const [selectedBookTitle, setSelectedBookTitle] = useState(''); // Store selected book title
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortField, setSortField] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    // Fetch current user from Firebase Authentication
    const fetchCurrentUser = () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user.email); // Or user.displayName if you prefer
      }
    };
    fetchCurrentUser();

    const fetchBooks = async () => {
      try {
        const booksCollection = collection(firestore, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
        }));
        setBooks(booksList);
      } catch (error) {
        console.error('Error fetching books:', error.message);
      }
    };

    fetchBooks();
    fetchTransactions();
  }, []);

  // Fetch totalNumber, currentStock, and book title when a book is selected
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!selectedBookId) {
        setTotalNumber('-');
        setCurrentStock('-');
        setSelectedBookTitle(''); // Reset book title
        return;
      }

      try {
        const bookDocRef = doc(firestore, 'books', selectedBookId);
        const bookDoc = await getDoc(bookDocRef);
        if (bookDoc.exists()) {
          setTotalNumber(bookDoc.data().totalNumber);
          setCurrentStock(bookDoc.data().currentStock);
          setSelectedBookTitle(bookDoc.data().title); // Set the selected book's title
        }
      } catch (error) {
        console.error('Error fetching book details:', error.message);
      }
    };

    fetchBookDetails();
  }, [selectedBookId]);

  const fetchTransactions = async () => {
    try {
      const transactionsQuery = query(
        collection(firestore, 'inventoryTransactions'),
        orderBy('transactionDate', 'desc') // Ensure sorting by date
      );
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactionsList = transactionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsList);
      setFilteredTransactions(transactionsList); // Initialize filtered transactions
    } catch (error) {
      console.error('Error fetching transactions:', error.message);
    }
  };

  const handleSubmit = async () => {
    // Reset success and error messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validation: Ensure a book is selected
    if (!selectedBookId) {
      setErrorMessage(
        'Please select a book before submitting the transaction.'
      );
      return;
    }

    // Validation: Ensure quantityChange is not 0
    if (quantityChange === 0) {
      setErrorMessage(
        'Quantity change cannot be 0. Please enter a valid number.'
      );
      return;
    }

    // Validation: Ensure invoice/write-off request is filled
    if (!invoiceOrWriteOff) {
      setErrorMessage('Invoice/Write-off request is required.');
      return;
    }

    // Fetch the current user again to make sure we have the latest user data
    const user = auth.currentUser;
    if (!user) {
      setErrorMessage('You must be logged in to submit a transaction.');
      return;
    }

    const userEmail = user.email; // Store the user's email for the transaction

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit this transaction?'
    );
    if (!confirmSubmit) return;

    try {
      const bookDocRef = doc(firestore, 'books', selectedBookId);
      const bookDoc = await getDoc(bookDocRef);
      if (!bookDoc.exists()) {
        setErrorMessage('Book not found!');
        return;
      }

      const currentTotalNumber = bookDoc.data().totalNumber;
      const currentCurrentStock = bookDoc.data().currentStock;

      // Check if the disposal amount exceeds current stock
      if (
        quantityChange < 0 &&
        Math.abs(quantityChange) > currentCurrentStock
      ) {
        setErrorMessage('Attempted disposal exceeds available stock.');
        return;
      }

      // Update the totalNumber and currentStock in the books collection
      const newTotalNumber = currentTotalNumber + quantityChange;
      const newCurrentStock = currentCurrentStock + quantityChange;

      // Add the transaction to the inventoryTransactions collection
      await addDoc(collection(firestore, 'inventoryTransactions'), {
        bookId: selectedBookId,
        bookTitle: selectedBookTitle, // Add the book title
        transactionBy: userEmail, // Add the user's email
        quantityChange, // Renamed from numberOfBooks
        invoiceOrWriteOff, // Add the invoice/write-off request input
        transactionDate: new Date(),
        totalNumber: newTotalNumber,
      });

      await updateDoc(bookDocRef, {
        totalNumber: newTotalNumber,
        currentStock: newCurrentStock,
      });

      setSuccessMessage('Transaction successful!');
      clearForm();
      fetchTransactions(); // Refresh the transactions table after a successful transaction
    } catch (error) {
      setErrorMessage('Error submitting transaction: ' + error.message);
    }
  };

  const clearForm = () => {
    setSelectedBookId('');
    setQuantityChange(0); // Reset quantity change
    setTotalNumber('-'); // Reset to '-'
    setCurrentStock('-'); // Reset to '-'
    setInvoiceOrWriteOff(''); // Clear invoice/write-off input
    setErrorMessage(''); // Clear any error message
    setSuccessMessage(''); // Clear success message
  };

  const handleInputChange = () => {
    // Clear error message when the user makes a change
    setErrorMessage('');
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

  return (
    <div className='inventory-form'>
      <h2>Manage Inventory</h2>

      <label htmlFor='bookId'>Book:</label>
      <select
        id='bookId'
        value={selectedBookId}
        onChange={(e) => {
          setSelectedBookId(e.target.value);
          handleInputChange(); // Clear error when book is selected
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

      <div className='book-stock-info'>
        <p>
          <strong>Total Number:</strong> {totalNumber}
        </p>
        <p>
          <strong>Current Stock:</strong> {currentStock}
        </p>
      </div>

      <label htmlFor='quantityChange'>Quantity Change:</label>
      <input
        type='number'
        id='quantityChange'
        value={quantityChange}
        onChange={(e) => {
          setQuantityChange(parseInt(e.target.value));
          handleInputChange(); // Clear error when quantity is changed
        }}
      />

      <label htmlFor='invoiceOrWriteOff'>Invoice/Write-off Request:</label>
      <input
        type='text'
        id='invoiceOrWriteOff'
        value={invoiceOrWriteOff}
        onChange={(e) => {
          setInvoiceOrWriteOff(e.target.value);
          handleInputChange(); // Clear error when invoice/write-off is changed
        }}
        placeholder='Enter invoice or write-off request'
        required
      />

      {/* Display error or success message */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <div className='inventory-buttons'>
        <button type='button' onClick={handleSubmit}>
          Submit
        </button>
        <button type='button' onClick={clearForm}>
          Clear
        </button>
      </div>

      {/* Transaction Overview */}
      <h3>Transaction Overview</h3>
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
        <input
          type='text'
          name='invoiceOrWriteOff'
          placeholder='Invoice/Write-off'
          value={filterField === 'invoiceOrWriteOff' ? filterValue : ''}
          onChange={handleFilterChange}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('bookTitle')}>Book Title</th>
            <th onClick={() => handleSort('transactionBy')}>Transaction By</th>
            <th onClick={() => handleSort('quantityChange')}>
              Quantity Change
            </th>
            <th onClick={() => handleSort('totalNumber')}>Total Number</th>
            <th onClick={() => handleSort('invoiceOrWriteOff')}>
              Invoice/Write-off
            </th>
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
              <td>{transaction.totalNumber}</td>
              <td>{transaction.invoiceOrWriteOff}</td>
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

export default Inventory;
