import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQBif7xVLJw4iC_LnXNtdvpbEbgg8vHZI",
  authDomain: "salesiq-adf63.firebaseapp.com",
  projectId: "salesiq-adf63",
  storageBucket: "salesiq-adf63.firebasestorage.app",
  messagingSenderId: "429780607904",
  appId: "1:429780607904:web:6291ebb2ceb473cd3afac5",
  measurementId: "G-64HZCPL71C",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
