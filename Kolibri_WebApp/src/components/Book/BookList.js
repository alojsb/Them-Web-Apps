import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import './BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { userRole } = useAuth(); // Fetch userRole from AuthContext

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollection = collection(firestore, 'books');
        const booksSnapshot = await getDocs(booksCollection);
        const booksList = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksList);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className='book-list'>
      <h2>Book List</h2>
      {userRole === 'admin' && (
        <button
          className='add-book-button'
          onClick={() => navigate('/add-book')}
        >
          Add Book
        </button>
      )}
      <div className='book-grid'>
        {books.map((book) => (
          <Link key={book.id} to={`/books/${book.id}`} className='book-card'>
            <img
              src={book.coverImageURL}
              alt={book.title}
              className='book-cover'
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BookList;
