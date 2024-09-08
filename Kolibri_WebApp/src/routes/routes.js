import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import BookList from '../components/Book/BookList';
import BookDetail from '../components/Book/BookDetail';
import BookForm from '../components/Book/BookForm';
import UserList from '../components/User/UserList';
import Home from '../components/Home';
import NotFound from '../components/NotFound';
import Inventory from '../components/Book/Inventory';
import Rental from '../components/Book/Rental'; // New Rental Component

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/books' element={<BookList />} />
    <Route path='/books/:id' element={<BookDetail />} />
    <Route path='/add-book' element={<BookForm editMode={false} />} />
    <Route path='/edit-book/:id' element={<BookForm editMode={true} />} />
    <Route path='/users' element={<UserList />} />
    <Route path='/inventory' element={<Inventory />} />
    <Route path='/rental' element={<Rental />} /> {/* New Route for Rentals */}
    <Route path='/not-found' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
