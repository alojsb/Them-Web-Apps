import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import './BookDetail.css'; // Import the CSS file

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookRef = doc(firestore, 'books', id);
        const bookSnap = await getDoc(bookRef);

        if (bookSnap.exists()) {
          setBook(bookSnap.data());
        } else {
          setError('Book not found');
        }
      } catch (err) {
        setError('An error occurred while fetching the book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (error) {
      navigate('/not-found'); // Redirect to 404 page if error occurs
    }
  }, [error, navigate]);

  const handleBackClick = () => {
    navigate('/books'); // Navigate back to the BookList screen
  };

  const handleEditClick = () => {
    navigate(`/edit-book/${id}`); // Navigate to the edit book form
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='book-detail'>
      <h2>Book Details</h2>
      {book && (
        <div>
          <h3>{book.title}</h3>
          <p>
            <strong>Description:</strong> {book.description}
          </p>
          <p>
            <strong>Author:</strong> {book.author}
          </p>
          <p>
            <strong>Year:</strong> {book.year}
          </p>
          <p>
            <strong>ISBN:</strong> {book.isbn}
          </p>
          <p>
            <strong>Script:</strong> {book.script}
          </p>
          <p>
            <strong>Language:</strong> {book.language}
          </p>
          <p>
            <strong>Genre:</strong> {book.genre}
          </p>
          <p>
            <strong>Total Number:</strong> {book.totalNumber}
          </p>
          <p>
            <strong>Current Stock:</strong> {book.currentStock}
          </p>
          <button className='back-button' onClick={handleBackClick}>
            Back
          </button>
          <button className='edit-button' onClick={handleEditClick}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
