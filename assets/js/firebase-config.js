// assets/js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrLBGiT65Fft5ZpBKs7qhLdEMrzfKty8E",
  authDomain: "sri-electronics.firebaseapp.com",
  projectId: "sri-electronics",
  storageBucket: "sri-electronics.appspot.com",
  messagingSenderId: "984956048342",
  appId: "1:984956048342:web:fd6a04163c3e5e6f478a77",
  measurementId: "G-MD1MWC0X4S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export for use in other files
export { app, auth, db, storage, analytics };
