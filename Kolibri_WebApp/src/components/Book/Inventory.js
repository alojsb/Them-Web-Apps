import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import './Inventory.css';

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [numberOfBooks, setNumberOfBooks] = useState(0);
  const [totalNumber, setTotalNumber] = useState('-'); // Initial value is '-'
  const [currentStock, setCurrentStock] = useState('-'); // Initial value is '-'
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  useEffect(() => {
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
  }, []);

  // Fetch totalNumber and currentStock when a book is selected
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!selectedBookId) {
        setTotalNumber('-');
        setCurrentStock('-');
        return;
      }

      try {
        const bookDocRef = doc(firestore, 'books', selectedBookId);
        const bookDoc = await getDoc(bookDocRef);
        if (bookDoc.exists()) {
          setTotalNumber(bookDoc.data().totalNumber);
          setCurrentStock(bookDoc.data().currentStock);
        }
      } catch (error) {
        console.error('Error fetching book details:', error.message);
      }
    };

    fetchBookDetails();
  }, [selectedBookId]);

  const handleSubmit = async () => {
    // Reset success and error messages
    setErrorMessage('');
    setSuccessMessage('');

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
      if (numberOfBooks < 0 && Math.abs(numberOfBooks) > currentCurrentStock) {
        setErrorMessage(
          'Attempted disposal exceeds available stock. Please enter a smaller quantity.'
        );
        return;
      }

      // Update the inventoryTransactions collection with the transaction
      await addDoc(collection(firestore, 'inventoryTransactions'), {
        bookId: selectedBookId,
        numberOfBooks,
        transactionDate: new Date(),
      });

      // Update the totalNumber and currentStock in the books collection
      const newTotalNumber = currentTotalNumber + numberOfBooks;
      const newCurrentStock = currentCurrentStock + numberOfBooks;

      await updateDoc(bookDocRef, {
        totalNumber: newTotalNumber,
        currentStock: newCurrentStock,
      });

      setSuccessMessage('Transaction successful!');
      clearForm();
    } catch (error) {
      setErrorMessage('Error submitting transaction: ' + error.message);
    }
  };

  const clearForm = () => {
    setSelectedBookId('');
    setNumberOfBooks(0);
    setTotalNumber('-'); // Reset to '-'
    setCurrentStock('-'); // Reset to '-'
    setErrorMessage(''); // Clear any error message
    setSuccessMessage(''); // Clear success message
  };

  return (
    <div className='inventory-form'>
      <h2>Manage Inventory</h2>

      <label htmlFor='bookId'>Book:</label>
      <select
        id='bookId'
        value={selectedBookId}
        onChange={(e) => setSelectedBookId(e.target.value)}
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

      <label htmlFor='numberOfBooks'>Number of Books:</label>
      <input
        type='number'
        id='numberOfBooks'
        value={numberOfBooks}
        onChange={(e) => setNumberOfBooks(parseInt(e.target.value))}
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
    </div>
  );
};

export default Inventory;
