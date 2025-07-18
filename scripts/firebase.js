import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    onSnapshot,
    increment,
    arrayUnion,
    query,
    where,
    collection,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0mPfN-6M0SMUmQytqhGvC9w1ZyZ8x8WI",
    authDomain: "quizmaker-99237.firebaseapp.com",
    projectId: "quizmaker-99237",
    storageBucket: "quizmaker-99237.firebasestorage.app",
    messagingSenderId: "279136827743",
    appId: "1:279136827743:web:1a2def86085bdefff19eea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    doc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc,
    onSnapshot,
    increment,
    arrayUnion,
    query,
    where,
    collection,
    deleteDoc
};