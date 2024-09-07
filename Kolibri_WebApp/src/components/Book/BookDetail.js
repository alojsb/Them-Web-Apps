import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './BookDetail.css';

const BookDetail = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useAuth();

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

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book?'
    );
    if (confirmed) {
      try {
        const bookRef = doc(firestore, 'books', bookId);
        await deleteDoc(bookRef);
        alert('Book deleted successfully!');
        navigate('/books'); // Redirect to book list after deletion
      } catch (error) {
        console.error('Error deleting book:', error.message);
      }
    }
  };

  useEffect(() => {
    if (error) {
      navigate('/not-found'); // Redirect to 404 page if error occurs
    }
  }, [error, navigate]);

  const handleBackClick = () => {
    navigate('/books'); // Navigate back to the BookList screen
  };

  const handleEditClick = () => {
    navigate(`/edit-book/${bookId}`); // Navigate to the edit book form
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='book-detail'>
      <h2>Book Details</h2>
      {book && (
        <div className='book-details-container'>
          <div className='book-info'>
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
          </div>
          {book.coverImageURL && (
            <div className='book-cover'>
              <img src={book.coverImageURL} alt={`${book.title} cover`} />
            </div>
          )}
        </div>
      )}
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
      <div className='book-detail-buttons'>
        <button className='back-button' onClick={handleBackClick}>
          Back
        </button>
        {userRole === 'admin' && (
          <>
            <button className='edit-button' onClick={handleEditClick}>
              Edit
            </button>
            <button className='delete-button' onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookDetail;
