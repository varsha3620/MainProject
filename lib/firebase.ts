import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {

  apiKey: "AIzaSyArSPR8CVOOZ5TDXSkszwPRRVeT3T0DZSI",

  authDomain: "ai-interview-app-9e053.firebaseapp.com",

  projectId: "ai-interview-app-9e053",

  storageBucket: "ai-interview-app-9e053.firebasestorage.app",

  messagingSenderId: "652443916024",

  appId: "1:652443916024:web:dd0b1f83d61e2823d18d0d"

};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
