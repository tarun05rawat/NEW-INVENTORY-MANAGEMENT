// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoMIAayKTinZbAmTojuYh4dzzu4F3EbAk",
  authDomain: "pantry-tracker-6a538.firebaseapp.com",
  projectId: "pantry-tracker-6a538",
  storageBucket: "pantry-tracker-6a538.appspot.com",
  messagingSenderId: "1066745303401",
  appId: "1:1066745303401:web:0f6d527a0f0f60ca0d2df8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { app, firestore, storage };
