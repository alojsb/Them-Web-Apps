import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const getFullName = (firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }
    return 'N/A';
  };

  return (
    <div className='user-list'>
      <div className='user-list-header'>
        <span className='user-header-item'>Full Name</span>
        <span className='user-header-item'>Email</span>
        <span className='user-header-item'>Role</span>
        <span className='user-header-item'>Date of Birth</span>
        <span className='user-header-item'>Profile</span>
      </div>

      {users.map((user) => (
        <div key={user.id} className='user-row'>
          <span className='user-item left-align'>
            {getFullName(user.firstName, user.lastName)}
          </span>
          <span className='user-item center-align'>{user.email}</span>
          <span className='user-item center-align'>{user.role}</span>
          <span className='user-item center-align'>
            {user.dateOfBirth || 'N/A'}
          </span>
          <span className='profile-icon-container'>
            <Link to={`/users/${user.id}`}>
              <FontAwesomeIcon icon={faUserCircle} className='profile-icon' />
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
