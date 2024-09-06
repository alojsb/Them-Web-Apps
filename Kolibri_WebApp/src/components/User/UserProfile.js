import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = doc(firestore, 'users', userId);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUser(userData);
        setEmail(userData.email);
        setRole(userData.role);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    try {
      const userDoc = doc(firestore, 'users', userId);
      await updateDoc(userDoc, { email, role });
      // Show success message
    } catch (error) {
      console.error(error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email" 
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleUpdate}>Update</button>
      {/* Add more actions like delete or email here if needed */}
    </div>
  );
};

export default UserProfile;
