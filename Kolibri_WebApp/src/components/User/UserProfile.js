import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '../../firebase/firebaseConfig';
import { useParams } from 'react-router-dom'; // To get userId from route params if needed
import { useAuth } from '../../context/AuthContext'; // Import useAuth for current user's role

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from route params
  const { userRole } = useAuth(); // Get current logged-in user's role
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // For file upload
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Define success message
  const [errorMessage, setErrorMessage] = useState(''); // Optional error message handling

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
          setProfilePictureUrl(userData.profilePictureUrl || '');
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
        dateOfBirth,
        profilePictureUrl: updatedProfilePictureUrl,
        ...(userRole === 'admin' && { role }), // Only update role if the current user is an admin
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
    <div>
      <h2>User Profile</h2>

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
      />

      {/* Role - Disable if not an admin */}
      <select
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          handleInputChange();
        }}
        disabled={userRole !== 'admin'} // Disable role change for non-admins
      >
        <option value='user'>User</option>
        <option value='admin'>Admin</option>
      </select>

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

      {/* Show profile picture if exists */}
      {profilePictureUrl && (
        <div>
          <img src={profilePictureUrl} alt='Profile' width='100' />
        </div>
      )}

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
