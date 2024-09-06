import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';

const BookForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'books'), { title, description });
      // Clear form or show success message
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Book</h2>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Title" 
        required 
      />
      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        placeholder="Description" 
        required 
      />
      <button type="submit">Add Book</button>
    </form>
  );
};

export default BookForm;
