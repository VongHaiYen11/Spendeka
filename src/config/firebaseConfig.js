// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAImiAZLLJOcq2s3c_oyTkumeI4fZfS5H0",
  authDomain: "spendeka-97ad5.firebaseapp.com",
  projectId: "spendeka-97ad5",
  storageBucket: "spendeka-97ad5.firebasestorage.app",
  messagingSenderId: "496121067471",
  appId: "1:496121067471:web:35aeb835374b940b2cc4ba",
  measurementId: "G-JY3ZZ4707R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
// This ensures the user stays logged in even after closing the app
let authInstance;
if (Platform.OS === "web") {
  // Use getAuth for web platform
  authInstance = getAuth(app);
} else {
  // Use initializeAuth with AsyncStorage persistence for React Native
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // If auth is already initialized, get the existing instance
    if (error.code === "auth/already-initialized") {
      authInstance = getAuth(app);
    } else {
      throw error;
    }
  }
}

// Only initialize Analytics on web platform (not available in React Native)
// Analytics requires DOM which doesn't exist in React Native
let analytics = null;
if (Platform.OS === "web") {
  try {
    const { getAnalytics } = require("firebase/analytics");
    analytics = getAnalytics(app);
  } catch (error) {
    // Analytics not available on this platform
  }
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = authInstance;