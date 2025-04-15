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
    // Store UID for saves/comments
    window.currentUser = user;
  } else {
    // If not logged in, redirect to login
    window.location.href = "index.html";
  }
});


const iconicAPODDates = [

  "2021-04-15", //First Image of Black Hole
  "2024-11-04", //Orion's Nebula
  "2023-11-09", //Crab Nebula
  "2020-02-14", //Pale Blue Dot
  "2022-10-20", //Pillars of Creation
  "2013-07-19", //Day Earth Smiled
  "2024-09-08", //Andromeda Galaxy
  "2024-08-05", //Milky Way
  "2020-07-14", //Comet NEOWISE
  "2022-02-06", //Blue Marble
  "2024-10-30", //Bubble Nebula
  "2021-05-14", //Sombrero Galaxy
  "2025-02-10", //Aurora Over Norway
  "2011-05-31", //Galactic Jet
  "2022-02-27" //Earthrise

];

async function getRandomAPOD(){

  const randomIndex = Math.floor(Math.random() * iconicAPODDates.length);
  const selectedDate = iconicAPODDates[randomIndex];

  let response = await fetch (`https://api.nasa.gov/planetary/apod?&api_key=${api_key}&date=${selectedDate}`);
  let data = await response.json();

  return data;
}

let random_date = null;

function makeCard(info){

  let result = document.querySelector('.content');

   random_date = info.date;
   console.log(random_date);
  let html = '';

  html += `
  
      <div class="post-content">
              <img class="post-image" src="${info.hdurl}" alt="Post Image">
              <div class="post-body">
                  <h1>${info.title}</h1>
                  <p class="date" >${info.date}</p>
                  <p>${info.explanation}</p>
                  <div class="post-footer">
                      <div class="reaction-buttons">
                          <button id ="comment-btn">&#x1F4A1; Comment</button>
                          <button id="save-btn">&#x1F516; Save</button>
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

  document.getElementById("viewBtn").addEventListener("click", () => {
    modal.style.display = "block";
    getCommentsForDate(random_date); 
  });

  document.getElementById("save-btn").addEventListener("click", saveRandomAPOD);

}

document.getElementById("first-btn").addEventListener("click", async () => {
  const data_use1 = await getRandomAPOD();
  makeCard(data_use1);
});

document.getElementById("again-btn").addEventListener("click", async () => {
  const data_use2 = await getRandomAPOD();
  makeCard(data_use2);
});

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
      apodDate: random_date,
      timestamp: new Date()
    });

    alert("Comment added and saved!");
  } 
  catch (error) {

    console.error("Error saving comment:", error);
    alert("Failed to save comment.");

  }

}

async function saveRandomAPOD() {
  const user = auth.currentUser;

  if (!user) {
      alert("Please log in to save posts.");
      return;
  }

  try {
      // Grab post data from DOM
      const post = document.querySelector(".post-content");
      const title = post.querySelector("h1").textContent;
      const imageurl = post.querySelector(".post-image").src;
      const date = post.querySelector(".date").textContent;

      await addDoc(collection(db, "savedPosts"), {
          uid: user.uid,
          email: user.email,
          date: date,
          title: title,
          imageurl: imageurl,
          timestamp: new Date()
      });

      alert("Post saved!");
  } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post.");
  }
}

const modal = document.getElementById("myModal");
const closeBtn = document.getElementsByClassName("close")[0];
const commentsContainer = document.getElementById("comments-container");

// viewBtn.onclick = function () {
//   modal.style.display = "block";
//   getCommentsForDate(random_date); 
// };

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




