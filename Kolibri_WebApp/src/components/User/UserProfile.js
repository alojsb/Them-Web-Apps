import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom';
import './UserProfile.css';
import { useAuth } from '../../context/AuthContext';
import { useUserSet } from '../../context/UserSettingsContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons'; // Add FontAwesome icon

const UserProfile = () => {
  const { userId } = useParams();
  const { userData, defaultMaleProfileUrl, updateUserData } = useUserSet(); // Use context for user data

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { userRole } = useAuth();

  // Local state for editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState(''); // Adding local state for role
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  // Sync local state with context-provided userData when it changes
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setDateOfBirth(userData.dateOfBirth || '');
      setRole(userData.role || ''); // Initialize role from context
      setProfilePictureUrl(userData.profilePictureUrl || defaultMaleProfileUrl);
    }
  }, [userData, defaultMaleProfileUrl]);

  const handleProfilePictureUpload = () => {
    document.getElementById('profilePictureInput').click(); // Trigger the hidden file input
  };

  const handleUpdate = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userDocRef = doc(firestore, 'users', userId);

      // Upload new profile picture to Firebase Storage if one is selected
      let updatedProfilePictureUrl = profilePictureUrl;
      if (profilePicture) {
        const profilePicRef = ref(storage, `profile-pics/${userId}`);
        await uploadBytes(profilePicRef, profilePicture);
        updatedProfilePictureUrl = await getDownloadURL(profilePicRef);
      }

      setProfilePicture(updatedProfilePictureUrl);

      // Prepare the updated user data
      const updatedData = {
        firstName,
        lastName,
        email,
        dateOfBirth,
        profilePictureUrl: updatedProfilePictureUrl,
      };

      // If the current user is an admin, include the role field in the update
      if (userRole === 'admin') {
        updatedData.role = role;
      }

      await updateDoc(userDocRef, updatedData);

      // Update the context with the new data
      await updateUserData(userId);

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

  if (!userData) return <div>Loading...</div>;

  return (
    <div className='user-profile'>
      <h2>User Profile</h2>

      {/* Profile Picture */}
      <div className='profile-picture-container'>
        <img
          src={profilePictureUrl}
          alt='Profile'
          className='profile-picture-full'
        />
        <FontAwesomeIcon
          icon={faCamera}
          className='fas fa-camera upload-icon'
          onClick={handleProfilePictureUpload}
        />
        <input
          type='file'
          id='profilePictureInput'
          accept='image/*'
          style={{ display: 'none' }} // Hidden input
          onChange={(e) => setProfilePicture(e.target.files[0])}
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

      {/* Role Dropdown - only visible and editable by admin */}
      {userRole === 'admin' && (
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value); // Update local role state
            handleInputChange();
          }}
        >
          <option value='user'>User</option>
          <option value='admin'>Admin</option>
        </select>
      )}

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
