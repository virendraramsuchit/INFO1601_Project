document.querySelectorAll(".dropdown-content a").forEach(link => 
    link.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  
        link.classList.add("active");
    })
);

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

let data = await getThisWeekInSpace ();

function makePost(info){

    let result = document.querySelector('#results');

    let html = '';

    for(let rec of info){

        html += `
        
        <div class="content">
            <div class="post-content">
                <img class="post-image" src="${rec.hdurl}" alt="Post Image">
                <div class="post-body">
                    <h1>${rec.title}</h1>
                    <p>${rec.explanation}</p>
                    <div class="post-footer">
                        <div class="reaction-buttons">
                            <button onclick="">&#x1F44D; Like</button>
                            <button onclick="">&#x1F4A1; Comment</button>
                            <button onclick="">&#x1F516; Save</button>
                        </div>
                        <div class="reaction-buttons">
                            <button onclick="">View Comments</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br>
        `;
    }

    result.innerHTML = html;

}

makePost(data);

