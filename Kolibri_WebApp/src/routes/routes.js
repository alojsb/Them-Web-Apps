import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import BookList from '../components/Book/BookList';
import BookDetail from '../components/Book/BookDetail';
import BookForm from '../components/Book/BookForm';
import UserList from '../components/User/UserList';
import UserProfile from '../components/User/UserProfile';
import Home from '../components/Home';
import NotFound from '../components/NotFound';
import Inventory from '../components/Book/Inventory';
import Rental from '../components/Book/Rental';
import Reservations from '../components/Reservations/Reservations';
import AdminReservations from '../components/Reservations/AdminReservations';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly }) => {
  const { userRole } = useAuth();
  if (adminOnly && userRole !== 'admin') {
    return <Navigate to='/' />;
  }
  return children;
};

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
    <Route path='/users/:userId' element={<UserProfile />} /> {/* New Route */}
    <Route path='/inventory' element={<Inventory />} />
    <Route path='/rental' element={<Rental />} />
    <Route
      path='/admin/reservations'
      element={
        <PrivateRoute adminOnly>
          <AdminReservations />
        </PrivateRoute>
      }
    />
    <Route path='/reservations' element={<Reservations />} />
    <Route path='/not-found' element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
