document.querySelectorAll(".dropdown-content a").forEach(link => 
    link.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  
        link.classList.add("active");
    })
);
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

import { API_KEY } from './apikey.js';

let api_key = API_KEY.key;

//1. APOD Section
async function getPostOfDay(){

    let response = await fetch(`https://api.nasa.gov/planetary/apod?&api_key=${api_key}`);
    let todayData = await response.json();

    return todayData;
}

let data = await getPostOfDay();
const APOD_DATE = data.date;

function makeCard(info){

    let result = document.querySelector('.content');

    let html = '';

    let mediaElement = '';

        if (info.media_type === 'image') {
            const imageUrl = info.hdurl || info.url;
            mediaElement = `<img class="post-image" src="${imageUrl}" alt="Post Image">`;
        } else if (info.media_type === 'video') {
            const thumbnail = info.thumbnail_url || '';
            mediaElement = `
                <div class="video-container">
                    <a href="${info.url}" target="_blank" rel="noopener noreferrer">
                        <img class="post-image" src="${thumbnail}" alt="Video Thumbnail">
                        <div class="play-button">&#9658;</div>
                    </a>
                </div>
            `;
        } else {
            mediaElement = `<p>Unsupported media type: ${info.media_type}</p>`;
        }

        // <img class="post-image" src="${info.hdurl}" alt="Post Image"></img>

    html += `
    
        <div class="post-content">
                ${mediaElement}
                <div class="post-body">
                    <h1>${info.title}</h1>
                    <p class="date" >${info.date}</p>
                    <p>${info.explanation}</p>
                    <div class="post-footer">
                        <div class="reaction-buttons">
                            <button onclick="">&#x1F44D; Like</button>
                            <button id ="comment-btn">&#x1F4A1; Comment</button>
                            <button id="save-btn" data-date="${info.date}" data-title="${info.title}" data-url="${info.hdurl}">&#x1F516; Save</button>
                        </div>
                        <div class="reaction-buttons">
                            <button id="viewBtn" onclick="">View Comments</button>
                        </div>
                    </div>
                </div>
            </div>
    
    `;

    result.innerHTML = html;
    document.getElementById("comment-btn").addEventListener("click", addComment);
    document.getElementById("save-btn").addEventListener("click", savePost);
}

makeCard(data);

async function addComment() {

    const user = auth.currentUser;

    if (!user) {
        alert("Please log in to comment.");
        return;
    }

    const userComment = prompt("Type your comment:");
    if(!userComment) return;

  try {

    await addDoc(collection(db, "comments"), {
      uid: user.uid,
      email: user.email,
      comment: userComment,
      apodDate: APOD_DATE,
      timestamp: new Date()
    });

    alert("Comment added and saved!");
  } 
  catch (error) {

    console.error("Error saving comment:", error);
    alert("Failed to save comment.");

  }

}

async function savePost() {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in to save posts.");
        return;
    }

    const saveBtn = document.getElementById("save-btn");

    const date = saveBtn.getAttribute("data-date");
    const title = saveBtn.getAttribute("data-title");
    const url = saveBtn.getAttribute("data-url");

    try {
        await addDoc(collection(db, "savedPosts"), {
            uid: user.uid,
            email: user.email,
            date: date,
            title: title,
            imageUrl: url,
            timestamp: new Date()
        });

        alert("Post saved!");
    } catch (error) {
        console.error("Error saving post:", error);
        alert("Failed to save post.");
    }
}

const modal = document.getElementById("myModal");
const viewBtn = document.getElementById("viewBtn");
const closeBtn = document.getElementsByClassName("close")[0];
const commentsContainer = document.getElementById("comments-container");

viewBtn.onclick = function () {
  modal.style.display = "block";
  getCommentsForDate(APOD_DATE); // Fetch comments for the current APOD
};

closeBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Function to fetch and display comments
async function getCommentsForDate(apodDate) {
  commentsContainer.innerHTML = "<p>Loading comments...</p>";

  try {
    const commentsRef = collection(db, "comments");
    const q = query(commentsRef, where("apodDate", "==", apodDate));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      commentsContainer.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
      return;
    }

    let html = "";
    querySnapshot.forEach(doc => {
      const commentData = doc.data();
      html += `
        <div class="comment">
          <strong>${commentData.email}</strong>
          <p>${commentData.comment}</p>
          <small>${new Date(commentData.timestamp?.toDate()).toLocaleString()}</small>
          <hr>
        </div>
      `;
    });

    commentsContainer.innerHTML = html;

  } catch (error) {
    console.error("Error fetching comments:", error);
    commentsContainer.innerHTML = "<p>Error loading comments.</p>";
  }
}