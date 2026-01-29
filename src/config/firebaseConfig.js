// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAImiAZLLJOcq2s3c_oyTkumeI4fZfS5H0",
  authDomain: "spendeka-97ad5.firebaseapp.com",
  projectId: "spendeka-97ad5",
  storageBucket: "spendeka-97ad5.firebasestorage.app",
  messagingSenderId: "496121067471",
  appId: "1:496121067471:web:35aeb835374b940b2cc4ba",
  measurementId: "G-JY3ZZ4707R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);