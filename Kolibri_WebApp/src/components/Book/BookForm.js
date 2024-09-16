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
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/firebaseConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import AuthContext
import './BookForm.css';

const BookForm = ({ editMode = false }) => {
  const { currentUser, userRole } = useAuth(); // Access user and role from AuthContext
  const { id: bookId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [isbn, setIsbn] = useState('');
  const [script, setScript] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [totalNumber, setTotalNumber] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageURL, setImageUrl] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (editMode && bookId) {
      // Fetch book details from Firestore
      const fetchBook = async () => {
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
          setImageUrl(bookData.coverImageURL || '');
        } else {
          console.error('No such book found!');
          navigate('/404');
        }
      };
      fetchBook();
    }
  }, [editMode, bookId, navigate]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    const storageRef = ref(storage, `book-covers/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setImageUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRole !== 'admin') {
      alert('Only admins can add or edit books.');
      return;
    }

    if (currentStock > totalNumber) {
      alert('Current stock cannot exceed total number of books.');
      return;
    }

    if (totalNumber < 0 || currentStock < 0) {
      alert('Stock numbers cannot be negative.');
      return;
    }

    const bookData = {
      title,
      description,
      author,
      year,
      isbn,
      script,
      language,
      genre,
      totalNumber,
      currentStock,
      coverImageURL,
      updatedAt: serverTimestamp(), // Timestamp for update
      updatedBy: currentUser.email, // User performing the update
    };

    try {
      if (editMode) {
        const bookRef = doc(firestore, 'books', bookId);
        await updateDoc(bookRef, bookData);
        alert('Book updated successfully!');
        navigate(`/books/${bookId}`);
      } else {
        const isbnQuery = query(
          collection(firestore, 'books'),
          where('isbn', '==', isbn)
        );
        const querySnapshot = await getDocs(isbnQuery);

        if (!querySnapshot.empty) {
          alert('A book with this ISBN already exists.');
          return;
        }

        // Add createdAt and createdBy for new book entry
        bookData.createdAt = serverTimestamp();
        bookData.createdBy = currentUser.email;

        const docRef = await addDoc(collection(firestore, 'books'), bookData);
        alert('Book added successfully!');
        navigate(`/books/${docRef.id}`);
      }
    } catch (error) {
      console.error('Error adding/updating book:', error.message);
    }
  };

  const handleCancel = () => {
    navigate(editMode ? `/books/${bookId}` : '/books');
  };

  return (
    <div className='form-container'>
      <form onSubmit={handleSubmit}>
        <div className='form-title'>
          <h2>{editMode ? 'Edit Book' : 'Add New Book'}</h2>
        </div>
        <div className='form-main'>
          <div className='form-segment-left'>
            <label>Book Cover</label>
            <div className='image-container'>
              {coverImageURL && (
                <img
                  src={coverImageURL}
                  alt='Book Cover'
                  className='book-cover-preview'
                />
              )}
            </div>

            <input
              type='file'
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder='Description'
            ></textarea>
          </div>
          <div className='form-segment-right'>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='Title'
            />

            <input
              type='text'
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              placeholder='Author'
            />

            <input
              type='number'
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              placeholder='Year'
            />

            <input
              type='text'
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              placeholder='ISBN'
            />

            <input
              type='text'
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder='Script'
            />

            <input
              type='text'
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder='Language'
            />

            <input
              type='text'
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder='Genre'
            />
          </div>
        </div>
        <div className='form-buttons'>
          <button className='button' type='button' onClick={handleCancel}>
            Cancel
          </button>
          <button className='button' type='submit'>
            {editMode ? 'Update Book' : 'Add Book'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
