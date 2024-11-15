// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, getDoc, query, where, doc, setDoc, writeBatch, updateDoc, addDoc, deleteDoc, orderBy, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPmYSjZIqrDgbipWBS0-q92Gn-0JiwFLQ",
  authDomain: "expenses-d8089.firebaseapp.com",
  projectId: "expenses-d8089",
  storageBucket: "expenses-d8089.appspot.com",
  messagingSenderId: "213596775315",
  appId: "1:213596775315:web:a86bdf09e3cdc45a63fe66",
  measurementId: "G-7XRSXY9G76"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

export { app, analytics, auth, db, collection, getDocs, query, where, doc, setDoc, getDoc, writeBatch, updateDoc, addDoc, storage, deleteDoc, orderBy, serverTimestamp };
