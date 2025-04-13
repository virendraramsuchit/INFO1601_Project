import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Display user email
    document.getElementById("user-email").textContent = user.email;
    // Store UID for saves/comments
    window.currentUser = user;
  } else {
    // If not logged in, redirect to login
    window.location.href = "index.html";
  }
});