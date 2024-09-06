import React, { useState, useEffect } from 'react';
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import './BookForm.css'; // Import the CSS file

const BookForm = ({ editMode = false }) => {
  const { id: bookId } = useParams(); // Get the book ID from URL params
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [script, setScript] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [totalNumber, setTotalNumber] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (editMode && bookId) {
      const fetchBookDetails = async () => {
        try {
          const bookRef = doc(firestore, 'books', bookId);
          const bookSnap = await getDoc(bookRef);

          if (bookSnap.exists()) {
            const bookData = bookSnap.data();
            setTitle(bookData.title);
            setDescription(bookData.description);
            setAuthor(bookData.author);
            setYear(bookData.year);
            setIsbn(bookData.isbn);
            setScript(bookData.script);
            setLanguage(bookData.language);
            setGenre(bookData.genre);
            setTotalNumber(bookData.totalNumber);
            setCurrentStock(bookData.currentStock);
          }
        } catch (error) {
          console.error('Error fetching book details: ', error.message);
        }
      };

      fetchBookDetails();
    }
  }, [editMode, bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(totalNumber) < 0 || parseInt(currentStock) < 0) {
      setErrorMessage('Total Number and Current Stock cannot be negative.');
      return;
    }

    if (parseInt(currentStock) > parseInt(totalNumber)) {
      setErrorMessage('Current Stock cannot be greater than Total Number.');
      return;
    }

    try {
      const booksRef = collection(firestore, 'books');
      const q = query(booksRef, where('isbn', '==', isbn));
      const querySnapshot = await getDocs(q);

      if (!editMode && !querySnapshot.empty) {
        setErrorMessage('A book with this ISBN already exists.');
        return;
      }

      if (editMode && bookId) {
        // Update existing book
        const bookRef = doc(firestore, 'books', bookId);
        await updateDoc(bookRef, {
          title,
          description,
          author,
          year,
          isbn,
          script,
          language,
          genre,
          totalNumber: parseInt(totalNumber),
          currentStock: parseInt(currentStock),
        });
        alert('Book successfully updated!');
      } else {
        // Add new book
        await addDoc(collection(firestore, 'books'), {
          title,
          description,
          author,
          year,
          isbn,
          script,
          language,
          genre,
          totalNumber: parseInt(totalNumber),
          currentStock: parseInt(currentStock),
        });
        alert('Book successfully added!');
      }

      navigate('/books');
    } catch (error) {
      console.error('Error saving book: ', error.message);
    }
  };

  const handleCancel = () => {
    if (editMode) {
      navigate(`/books/${bookId}`); // Navigate to BookDetail page if in edit mode
    } else {
      navigate('/books');
    }
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <h2>{editMode ? 'Edit Book' : 'Add New Book'}</h2>

        {errorMessage && <div className='error-message'>{errorMessage}</div>}

        <div className='form-group'>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title'
            required
          />
        </div>

        <div className='form-group'>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Description'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='text'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder='Author'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='number'
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder='Year'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='text'
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder='ISBN'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='text'
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder='Script'
          />
        </div>

        <div className='form-group'>
          <input
            type='text'
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder='Language'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='text'
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder='Genre'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='number'
            value={totalNumber}
            onChange={(e) => setTotalNumber(e.target.value)}
            placeholder='Total Number'
            required
          />
        </div>

        <div className='form-group'>
          <input
            type='number'
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            placeholder='Current Stock'
            required
          />
        </div>

        <div className='button-group'>
          <button type='submit'>{editMode ? 'Update Book' : 'Add Book'}</button>
          <button type='button' onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
