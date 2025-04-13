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

async function showDataForMonth(){

   await getDataByMonth();

   let results = document.querySelector("#results");

   let html = '';

   for(let rec of data_arr){
        html += `
            
            <div class="post-content">
                        <img class="post-image" src="${rec.hdurl}" alt="Post Image">
                        <div class="post-body">
                            <h1>${rec.title}</h1>
                            <p class="date" >${rec.date}</p>
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

            <br>

            <button type="button" class="content-btn" onclick="goBack()"> Back &#x2728;</button>
        `;
   }

   results.innerHTML = html;

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

window.showDataForMonth = showDataForMonth;
window.goBack = goBack;
