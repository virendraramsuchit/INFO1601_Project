import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();

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

let data_arr = [];

async function getDataByMonth(){

    data_arr = [];

    const year = document.getElementById('year-input').value;
    const month = document.getElementById('month-input').value;

    const paddedMonth1 = month.toString().padStart(2, '0');
    const startDate = `${year}-${paddedMonth1}-01`;

    let endDate;

    if(month === 9 || month === 4 || month === 6 || month === 11){

        const paddedMonth2 = month.toString().padStart(2, '0');
        endDate = `${year}-${paddedMonth2}-30`;
    }

    else if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))){

        const paddedMonth2 = month.toString().padStart(2, '0');
        endDate = `${year}-${paddedMonth2}-29`;
    }

    else if(month ===2 && (year % 4) !== 0){

        const paddedMonth2 = month.toString().padStart(2, '0');
        endDate = `${year}-${paddedMonth2}-28`;
    }

    else{

        const paddedMonth2 = month.toString().padStart(2, '0');
        endDate = `${year}-${paddedMonth2}-31`;
    }

    let response = await fetch (`https://api.nasa.gov/planetary/apod?&api_key=${api_key}&start_date=${startDate}&end_date=${endDate}`);
    let data = await response.json();

    for(let rec of data){

        data_arr.push(rec);
    }

}

let currentPage = 1;
const postsPerPage = 7;

async function showDataForMonth(){

    await getDataByMonth();
    currentPage = 1; // Reset to first page on new data
    renderPosts();

}

// async function showDataForMonth(){

//    await getDataByMonth();

//    let results = document.querySelector("#results");

//    let html = '';

//    for(let rec of data_arr){
//         html += `
            
//             <div class="post-content">
//                         <img class="post-image" src="${rec.hdurl}" alt="Post Image">
//                         <div class="post-body">
//                             <h1>${rec.title}</h1>
//                             <p class="date" >${rec.date}</p>
//                             <p>${rec.explanation}</p>
//                             <div class="post-footer">
//                                 <div class="reaction-buttons">
//                                     <button onclick="">&#x1F44D; Like</button>
//                                     <button class="comment-btn" data-date="${rec.date}">&#x1F4A1; Comment</button>
//                                     <button class="save-btn">&#x1F516; Save</button>
//                                 </div>
//                                 <div class="reaction-buttons">
//                                     <button class="view-comments-btn" data-date="${rec.date}">View Comments</button>
//                                 </div>
//                             </div>
//                         </div>
//                 </div>

//             <br>

//             <button type="button" class="content-btn" onclick="goBack()"> Back &#x2728;</button>
//         `;
//    }

//    results.innerHTML = html;

//    attachCommentListeners();
//    savePostListeners();
// }

function renderPosts() {
    const results = document.querySelector("#results");
    let html = "";

    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    const postsToShow = data_arr.slice(start, end);

    for (let rec of postsToShow) {

        let mediaElement = '';

        if (rec.media_type === 'image') {
            const imageUrl = rec.hdurl || rec.url;
            mediaElement = `<img class="post-image" src="${imageUrl}" alt="Post Image">`;
        } else if (rec.media_type === 'video') {
            const thumbnail = rec.thumbnail_url || '';
            mediaElement = `
                <div class="video-container">
                    <a href="${rec.url}" target="_blank" rel="noopener noreferrer">
                        <img class="post-image" src="${thumbnail}" alt="Video Thumbnail">
                        <div class="play-button">&#9658;</div>
                    </a>
                </div>
            `;
        } else {
            mediaElement = `<p>Unsupported media type: ${rec.media_type}</p>`;
        }

        // <img class="post-image" src="${rec.hdurl}" alt="Post Image"></img>
        html += `
            <div class="post-content">
                ${mediaElement}
                <div class="post-body">
                    <h1>${rec.title}</h1>
                    <p class="date">${rec.date}</p>
                    <p>${rec.explanation}</p>
                    <div class="post-footer">
                        <div class="reaction-buttons">
                            <button onclick="">&#x1F44D; Like</button>
                            <button class="comment-btn" data-date="${rec.date}">&#x1F4A1; Comment</button>
                            <button class="save-btn">&#x1F516; Save</button>
                        </div>
                        <div class="reaction-buttons">
                            <button class="view-comments-btn" data-date="${rec.date}">View Comments</button>
                        </div>
                    </div>
                </div>
            </div>
            <br>
        `;
    }

    html += `
        <div style="text-align:center;">
            <button class="content-btn" onclick="goToPreviousPage()" ${currentPage === 1 ? 'disabled' : ''}>⬅️ Previous</button>
            <button class="content-btn" onclick="goToNextPage()" ${(currentPage * postsPerPage >= data_arr.length) ? 'disabled' : ''}>Next ➡️</button>
        </div>
        <br>
        <button type="button" class="content-btn" onclick="goBack()"> Back &#x2728;</button>
    `;

    results.innerHTML = html;

    attachCommentListeners();
    savePostListeners();
}

function attachCommentListeners() {
    document.querySelectorAll(".comment-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const date = button.getAttribute("data-date");
            const user = auth.currentUser;

            if (!user) {
                alert("Please log in to comment.");
                return;
            }

            const userComment = prompt("Type your comment:");
            if (!userComment) return;

            try {
                await addDoc(collection(db, "comments"), {
                    uid: user.uid,
                    email: user.email,
                    comment: userComment,
                    apodDate: date,
                    timestamp: new Date()
                });
                alert("Comment added!");
            } catch (error) {
                console.error("Error saving comment:", error);
                alert("Failed to save comment.");
            }
        });
    });

    document.querySelectorAll(".view-comments-btn").forEach(button => {
        button.addEventListener("click", () => {
            const date = button.getAttribute("data-date");
            document.getElementById("myModal").style.display = "block";
            getCommentsForDate(date);
        });
    });
}

function goBack(){

    let results = document.querySelector("#results");

    let html = '';
 
         html += `
             
        <div class="content-form">
        <div class="post-content-form">

            <form>
              <label for="year">Enter Year (e.g. 2020):</label>
              <input type="number" id="year-input" required>
          
              <label for="month">Enter Month (1-12):</label>
              <input type="number" id="month-input" required>
          
              <button type="button" class="content-btn" onclick="showDataForMonth()">Reveal the Stars &#x2728;</button>
            </form>

            <div class="post-body-inputform">
                <h1>Ever wondered what the stars were up to at a specific moment in time? Enter a date and find out! &#x1F30C; &#x1F559;</h1>
                <br>
                <p>Some ideas: <p>
                <p>1. Your birth month<br> 2. A memorable month to you or someone special<br>3. Just pick one for the fun of it</p>
                </div>
            </div>
        </div>
 
         `;
 
    results.innerHTML = html;

}

async function getCommentsForDate(date) {
    const commentsContainer = document.getElementById("comments-container");
    commentsContainer.innerHTML = "<p>Loading comments...</p>";

    try {
        const commentsRef = collection(db, "comments");
        const q = query(
            commentsRef,
            where("apodDate", "==", date),
            // orderBy("timestamp", "asc")
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            commentsContainer.innerHTML = "<p>No comments yet. Be the first to leave one!</p>";
            return;
        }

        let html = `<h3>Comments for ${date}</h3><ul class="comment-list">`;

        querySnapshot.forEach(doc => {
            const { email, comment, timestamp } = doc.data();
            const timeStr = new Date(timestamp.seconds * 1000).toLocaleString();
            html += `
                <li class="comment-item">
                    <strong>${email}</strong> <em>(${timeStr})</em>:<br>
                    <span>${comment}</span>
                </li>
            `;
        });

        html += "</ul>";
        commentsContainer.innerHTML = html;

    } catch (error) {
        console.error("Error getting comments:", error);
        commentsContainer.innerHTML = "<p>Failed to load comments.</p>";
    }
}

function savePostListeners() {
    document.querySelectorAll(".save-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const user = auth.currentUser;

            if (!user) {
                alert("Please log in to save posts.");
                return;
            }

            const post = button.closest(".post-content");
            const title = post.querySelector("h1").textContent;
            const imageurl = post.querySelector(".post-image").src;
            const date = post.querySelector(".date").textContent;

            try {
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
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("myModal");
    const closeBtn = document.getElementsByClassName("close")[0];
  
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  });

    window.goToNextPage = function() {
    if (currentPage * postsPerPage < data_arr.length) {
        currentPage++;
        renderPosts();
    }
};

    window.goToPreviousPage = function() {
    if (currentPage > 1) {
        currentPage--;
        renderPosts();
    }
};

window.showDataForMonth = showDataForMonth;
window.goBack = goBack;
