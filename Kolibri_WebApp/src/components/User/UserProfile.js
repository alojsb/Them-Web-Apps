import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom';
import './UserProfile.css';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (currentUser) {
      console.log('User role from AuthContext:', userRole); // This should print the correct role
    }
  }, [currentUser, userRole]);

  const setDefaultProfilePicUrl = async () => {
    setProfilePictureUrl(
      'https://firebasestorage.googleapis.com/v0/b/kolibridb-27021.appspot.com/o/profile-pics%2Fdefault-profile-male.jpg?alt=media&token=3d4497dc-6863-4510-8e2b-87d5edadedd2'
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error('No userId provided');
        return;
      }

      try {
        const userDoc = doc(firestore, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUser(userData);
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setEmail(userData.email);
          setRole(userData.role);
          setDateOfBirth(userData.dateOfBirth || '');
          setProfilePictureUrl(
            userData.profilePictureUrl || setDefaultProfilePicUrl
          );
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage(''); // Clear success message before update

    try {
      const userDocRef = doc(firestore, 'users', userId);

      // If a new profile picture is selected, upload it to Firebase Storage and get the URL
      let updatedProfilePictureUrl = profilePictureUrl;
      if (profilePicture) {
        const profilePicRef = ref(storage, `profile-pics/${userId}`);
        await uploadBytes(profilePicRef, profilePicture); // Upload the image file
        updatedProfilePictureUrl = await getDownloadURL(profilePicRef); // Get the image URL
      }

      // Prepare the updated user data (only the URL should be stored in Firestore)
      const updatedData = {
        firstName,
        lastName,
        email,
        dateOfBirth,
        profilePictureUrl: updatedProfilePictureUrl, // Store the URL, not the file
      };

      // If the current user is an admin, include the role field in the update
      if (userRole === 'admin') {
        updatedData.role = role;
      }

      console.log(updatedData);
      // Update the Firestore document with the user data
      await updateDoc(userDocRef, updatedData);

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage('Error updating profile: ' + error.message);
    }

    setLoading(false);
  };

  const handleInputChange = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className='user-profile'>
      <h2>User Profile</h2>

      {/* Profile Picture */}
      <div className='profile-picture-container'>
        <img
          src={profilePictureUrl} // Use the profilePictureUrl for display
          alt='Profile'
          className='profile-picture-full'
        />
      </div>

      {/* First Name */}
      <input
        type='text'
        value={firstName}
        onChange={(e) => {
          setFirstName(e.target.value);
          handleInputChange();
        }}
        placeholder='First Name'
      />

      {/* Last Name */}
      <input
        type='text'
        value={lastName}
        onChange={(e) => {
          setLastName(e.target.value);
          handleInputChange();
        }}
        placeholder='Last Name'
      />

      {/* Role Dropdown - only visible and editable by admin */}
      {userRole === 'admin' && (
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            handleInputChange();
          }}
        >
          <option value='user'>User</option>
          <option value='admin'>Admin</option>
        </select>
      )}

      {/* Email */}
      <input
        type='email'
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          handleInputChange();
        }}
        placeholder='Email'
        disabled // Prevent user from changing email manually
      />

      {/* Date of Birth */}
      <input
        type='date'
        value={dateOfBirth}
        onChange={(e) => {
          setDateOfBirth(e.target.value);
          handleInputChange();
        }}
        placeholder='Date of Birth'
      />

      {/* Profile Picture Upload */}
      <div>
        <label htmlFor='profilePicture'>Profile Picture</label>
        <input
          type='file'
          id='profilePicture'
          accept='image/*'
          onChange={(e) => {
            setProfilePicture(e.target.files[0]); // Set the file, not base64
            handleInputChange();
          }}
        />
      </div>

      {/* Update Button */}
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update'}
      </button>

      {/* Success and Error Messages */}
      {successMessage && <p className='success-message'>{successMessage}</p>}
      {errorMessage && <p className='error-message'>{errorMessage}</p>}
    </div>
  );
};

export default UserProfile;
