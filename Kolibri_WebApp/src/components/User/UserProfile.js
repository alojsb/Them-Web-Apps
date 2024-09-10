import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom'; // To get userId from route params if needed
import placeholder from '../../assets/placeholder-profile.jpg'; // Placeholder for profile picture
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from route params
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // For file upload
  const [profilePictureUrl, setProfilePictureUrl] = useState(placeholder); // Set default placeholder
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
          setProfilePictureUrl(userData.profilePictureUrl || placeholder); // Set profile pic or placeholder
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

      // If a new profile picture is selected, upload it
      let updatedProfilePictureUrl = profilePictureUrl;
      if (profilePicture) {
        const profilePicRef = ref(storage, `profile-pics/${userId}`);
        await uploadBytes(profilePicRef, profilePicture);
        updatedProfilePictureUrl = await getDownloadURL(profilePicRef);
      }

      // Update user document in Firestore
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        email,
        role,
        dateOfBirth,
        profilePictureUrl: updatedProfilePictureUrl,
      });

      setSuccessMessage('Profile updated successfully!'); // Set success message
    } catch (error) {
      setErrorMessage('Error updating profile: ' + error.message); // Optional error handling
    }
    setLoading(false);
  };

  const handleInputChange = () => {
    setSuccessMessage(''); // Clear success message on any input change
    setErrorMessage(''); // Optional: clear error message
  };

  if (!user) return <div>Loading...</div>;

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

      {/* Profile Picture Upload */}
      <div>
        <label htmlFor='profilePicture'>Profile Picture</label>
        <input
          type='file'
          id='profilePicture'
          accept='image/*'
          onChange={(e) => {
            setProfilePicture(e.target.files[0]);
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
