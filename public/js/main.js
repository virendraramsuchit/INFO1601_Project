document.querySelectorAll(".dropdown-content a").forEach(link => 
    link.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  
        link.classList.add("active");
    })
);

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { firebaseConfig } from './firebaseConfig.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
  

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

async function getThisWeekInSpace (){

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];

    const startDate = new Date();
    startDate.setDate(today.getDate() - 6);
    const startDateStr = startDate.toISOString().split('T')[0];

    let response = await fetch(`https://api.nasa.gov/planetary/apod?&api_key=${api_key}&start_date=${startDateStr}&end_date=${endDate}`);
    let thisWeekData = await response.json();

    return thisWeekData;

}


function makePost(info) {
    let result = document.querySelector('#results');
    let html = '';

    for (let rec of info) {
        
        html += `
        <div class="content">
            <div class="post-content">
                <img class="post-image" src="${rec.hdurl}" alt="Post Image">
                <div class="post-body">
                    <h1>${rec.title}</h1>
                    <p>${rec.explanation}</p>
                    <div class="post-footer">
                        <div class="reaction-buttons">
                            <button class="like-btn">&#x1F44D; Like</button>
                            <button class="comment-btn" data-date="${rec.date}" data-title="${rec.title}">&#x1F4A1; Comment</button>
                            <button class="save-btn">&#x1F516; Save</button>
                        </div>
                        <div class="reaction-buttons">
                            <button class="view-comments-btn" data-date="${rec.date}" data-title="${rec.title}">View Comments</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>
        `;
    }

    result.innerHTML = html;

    attachCommentListeners(); // attach event handlers
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

// function makePost(info){

//     let result = document.querySelector('#results');

//     let html = '';

//     for(let rec of info){

//         html += `
        
//         <div class="content">
//             <div class="post-content">
//                 <img class="post-image" src="${rec.hdurl}" alt="Post Image">
//                 <div class="post-body">
//                     <h1>${rec.title}</h1>
//                     <p>${rec.explanation}</p>
//                     <div class="post-footer">
//                         <div class="reaction-buttons">
//                             <button onclick="">&#x1F44D; Like</button>
//                             <button onclick="">&#x1F4A1; Comment</button>
//                             <button onclick="">&#x1F516; Save</button>
//                         </div>
//                         <div class="reaction-buttons">
//                             <button onclick="">View Comments</button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <br>
//         `;
//     }

//     result.innerHTML = html;

// }

async function getCommentsForDate(date) {
    const q = query(
        collection(db, "comments"),
        where("apodDate", "==", date),
        
    );

    try {
        const querySnapshot = await getDocs(q);
        const commentsContainer = document.getElementById("comments-container");
        commentsContainer.innerHTML = ""; // Clear previous comments

        if (querySnapshot.empty) {
            commentsContainer.innerHTML = "<p>No comments yet.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const commentEl = document.createElement("div");
            commentEl.classList.add("comment");
            commentEl.innerHTML = `
                <p><strong>${data.email}</strong></p>
                <p>${data.comment}</p>
                <hr>
            `;
            commentsContainer.appendChild(commentEl);
        });
    } catch (error) {
        console.error("Error getting comments:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let data = await getThisWeekInSpace();
    makePost(data);
  });


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

