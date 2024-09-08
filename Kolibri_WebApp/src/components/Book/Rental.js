import React, { useState } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Rental.css'; // Add relevant styles

const Rental = () => {
  const [bookId, setBookId] = useState('');
  const [rentalAmount, setRentalAmount] = useState(1);
  const navigate = useNavigate();

  const handleRent = async () => {
    const bookRef = doc(firestore, 'books', bookId);

    try {
      await updateDoc(bookRef, {
        currentStock: increment(-rentalAmount), // Decrease stock
      });
      alert('Book rented successfully!');
    } catch (error) {
      console.error('Error renting book:', error.message);
    }
  };

  const handleReturn = async () => {
    const bookRef = doc(firestore, 'books', bookId);

    try {
      await updateDoc(bookRef, {
        currentStock: increment(rentalAmount), // Increase stock
      });
      alert('Book returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error.message);
    }
  };

  return (
    <div className='rental-container'>
      <h2>Manage Rentals</h2>
      <label>Book ID</label>
      <input
        type='text'
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        required
      />
      <label>Number of Books</label>
      <input
        type='number'
        value={rentalAmount}
        onChange={(e) => setRentalAmount(e.target.value)}
        min={1}
      />
      <button onClick={handleRent}>Rent</button>
      <button onClick={handleReturn}>Return</button>
    </div>
  );
};

export default Rental;
