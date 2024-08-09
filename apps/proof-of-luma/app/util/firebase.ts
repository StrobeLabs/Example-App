// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIn_5LrSjDmKXy_bg0WFBROf9clEkTEvg",
  authDomain: "strobe-blog.firebaseapp.com",
  projectId: "strobe-blog",
  storageBucket: "strobe-blog.appspot.com",
  messagingSenderId: "572192737057",
  appId: "1:572192737057:web:660e4241a74e7ff3356060",
  measurementId: "G-734Q88V3JC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// export const analytics = getAnalytics(app);

export const db = getFirestore(app);

export const storage = getStorage(app);