document.querySelectorAll(".dropdown-content a").forEach(link => 
    link.addEventListener("click", () => {
        document.querySelector(".active")?.classList.remove("active");  
        link.classList.add("active");
    })
);

import { API_KEY } from './apikey.js';

let api_key = API_KEY.key;

async function getThisWeekInSpace (){

    const today = new Date();
    const endDate = today.toISOString().split('T')[0];

    const startDate = new Date();
    startDate.setDate(today.getDate() - 7);
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
        
        <div class="post-content">
          
            <div class="post-body">
                <h1>${rec.title}</h1>
                <p>${rec.explanation}</p>
                <img class="post-image" src="${rec.hdurl}" alt="Post Image">
                </div>
    
                <div class="post-footer">
                    <div class="reaction-buttons">
                        <!--onclick activates firebase-->
                        <button onclick="">&#x1F44D; Like</button>
                        <button onclick="">&#x1F4A1; Comment</button>
                        <button  onclick="">&#x1F516; Save</button>
                    </div>

                    <div class="reaction-buttons">
                        <button  onclick="" >View Comments</button>
                        <!--onclick would trigger js and popup modal with comments-->
                    </div>
                </div>
        </div>

        `;
    }

    result.innerHTML = html;

}

makePost(data);

