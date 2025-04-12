document.querySelectorAll(".dropdown-content a").forEach(link => 
    link.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  
        link.classList.add("active");
    })
);

import { API_KEY } from './apikey.js';

let api_key = API_KEY.key;

//1. APOD Section
async function getPostOfDay(){

    let response = await fetch(`https://api.nasa.gov/planetary/apod?&api_key=${api_key}`);
    let todayData = await response.json();

    return todayData;
}

let data = await getPostOfDay();

function makeCard(info){

    let result = document.querySelector('.content');

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
    
    `;

    result.innerHTML = html;
}

makeCard(data);