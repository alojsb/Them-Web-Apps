import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDfdKyeHj6sYBqxpk9wDEI4yzqpuAxAnLw',
  authDomain: 'kolibridb-27021.firebaseapp.com',
  projectId: 'kolibridb-27021',
  storageBucket: 'kolibridb-27021.appspot.com',
  messagingSenderId: '406670304153',
  appId: '1:406670304153:web:0a6afab6cc03f80f72a908',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
