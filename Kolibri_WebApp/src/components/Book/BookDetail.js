import React from 'react';

const BookDetail = ({ book }) => {
  return (
    <div>
      <h2>{book.title}</h2>
      <p>{book.description}</p>
      {/* Add reservation functionality here */}
    </div>
  );
};

export default BookDetail;
