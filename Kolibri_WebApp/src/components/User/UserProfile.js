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
  const { userId } = useParams(); // Fetch the userId from the URL
  const { defaultNeutralProfileUrl, updateLoggedInUserData } = useUserSet(); // Get default profile picture URLs
  const { userRole } = useAuth();

  // Local state for the user profile data and loading state
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userData, setUserData] = useState(null);

  // Local state for editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  // Fetch user data based on the URL param userId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, 'users', userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          const fetchedUserData = userSnapshot.data();
          setUserData(fetchedUserData); // Set state with fetched data

          // Set local state for form fields
          setFirstName(fetchedUserData.firstName || '');
          setLastName(fetchedUserData.lastName || '');
          setEmail(fetchedUserData.email || '');
          setDateOfBirth(fetchedUserData.dateOfBirth || '');
          setRole(fetchedUserData.role || '');
          setProfilePictureUrl(
            fetchedUserData.profilePictureUrl || defaultNeutralProfileUrl
          );
        } else {
          setErrorMessage('User not found');
        }
      } catch (error) {
        setErrorMessage('Error fetching user data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, defaultNeutralProfileUrl]);

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

      setProfilePictureUrl(updatedProfilePictureUrl);

      // Prepare the updated user data
      const updatedData = {
        firstName,
        lastName,
        email,
        dateOfBirth,
        profilePictureUrl: updatedProfilePictureUrl,
      };

      // If the current user is an admin, allow updating the role
      if (userRole === 'admin') {
        updatedData.role = role;
      }

      await updateDoc(userDocRef, updatedData);

      // Update the user data if the current user is the one being edited
      if (userId === userData?.id) {
        await updateLoggedInUserData(userId);
      }

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (loading) return <div>Loading...</div>; // Show a loading state if data is still being fetched

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
            setRole(e.target.value);
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
