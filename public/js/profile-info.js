import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

import { API_KEY } from './apikey.js';

let api_key = API_KEY.key;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Display user email
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("display_name").textContent = user.email;
    // Store UID for saves/comments
    window.currentUser = user;
  } else {
    // If not logged in, redirect to login
    window.location.href = "index.html";
  }
});


async function displaySavedPosts() {
    const user = auth.currentUser;
  
    if (!user) {
      alert("Please log in to view saved posts.");
      return;
    }
  
    const savedPostsContainer = document.getElementById("saved-posts-container");
    savedPostsContainer.innerHTML = "<p>Loading saved posts...</p>";
  
    try {
      const savedRef = collection(db, "savedPosts");
      const q = query(savedRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        savedPostsContainer.innerHTML = "<p>You haven't saved any posts yet.</p>";
        return;
      }
  
      const uniquePostsMap = new Map();
  
      querySnapshot.forEach(doc => {
        const post = doc.data();
        // Use date as unique key for filtering duplicates
        if (!uniquePostsMap.has(post.date)) {
          uniquePostsMap.set(post.date, post);
        }
      });
  
      const uniquePosts = Array.from(uniquePostsMap.values());
  
      let html = "<h2>Your Saved Posts</h2>";
  
      uniquePosts.forEach(post => {
        html += `
          <div class="saved-post">
            <img src="${post.imageurl}" alt="Saved Image" style="max-width: 100%; height: auto;">
            <h3>${post.title}</h3>
            <p><strong>Date:</strong> ${post.date}</p>
            <hr>
          </div>
        `;
      });
  
      savedPostsContainer.innerHTML = html;
  
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      savedPostsContainer.innerHTML = "<p>Failed to load saved posts.</p>";
    }
  }

  window.displaySavedPosts = displaySavedPosts;
