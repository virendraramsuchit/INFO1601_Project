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

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     // Display user email
//     document.getElementById("user-email").textContent = user.email;
//     // Store UID for saves/comments
//     window.currentUser = user;
//   } else {
//     // If not logged in, redirect to login
//     window.location.href = "index.html";
//   }
// });

onAuthStateChanged(auth, (user) => {
    // const loadingElement = document.getElementById('loading');
    // loadingElement.style.display = 'block';  // Show loading indicator

    if (!user) {
        // Only redirect if not already on the login page
        if (!window.location.pathname.endsWith("index.html")) {
            setTimeout(() => {
                window.location.href = "index.html";
            }, 100);
        }
    }

    if (user) {
        // Set user info after authentication is confirmed
        document.getElementById("user-email").textContent = user.email;
        window.currentUser = user;

        // Only load content after auth state is ready
        getThisWeekInSpace().then((data) => {
            makePost(data);
            // loadingElement.style.display = 'none';  // Hide loading once posts are ready
        });
    } else {
        // Redirect user if not authenticated (with a slight delay to prevent immediate flicker)
        setTimeout(() => {
            window.location.href = "index.html";
        }, 100);
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

        html += `
        <div class="content">
            <div class="post-content">
                ${mediaElement}
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

    //event handlers
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

            // Try to get date from data attribute or fallback to parsing text
            const dateAttr = button.closest(".reaction-buttons").querySelector(".comment-btn")?.getAttribute("data-date");
            const dateText = post.querySelector(".date")?.textContent || post.querySelector("p").textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0];
            const date = dateAttr || dateText;

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

