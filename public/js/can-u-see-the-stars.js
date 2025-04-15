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

async function getTime(){

    const now = new Date();

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const time24hr = `${hours}:${minutes}`;

    return time24hr;
}

function isBetween10PMand3AM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return((hours >= 22 && hours <= 23) || (hours >= 0 && hours <= 3));
}

function isBetween4AMand6AM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 4 && hours <= 6);
}

function isBetween7AMand9AM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 7 && hours <= 9);
}

function isBetween10AMand12PM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 10 && hours <= 12);
}

function isBetween1PMand3PM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 13 && hours <= 15);
}

function isBetween4PMand6PM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 16 && hours <= 18);
}

function isBetween7PMand9PM(timeStr){

    const[hours, minutes]= timeStr.split(':').map(Number);
    return(hours >= 19 && hours <= 21);
}

async function getLocation(){

    return new Promise((resolve, reject) => {
        
        navigator.geolocation.getCurrentPosition(resolve,reject,{
            enableHighAccuracy:true,
            timeout: 5000
        })
    })
}


async function useLocationandTime(time){

    const pos = await getLocation();
    console.log(pos.coords.longitude);
    console.log(pos.coords.latitude);
    let key;
        
    if(isBetween10PMand3AM(time)){
        key = 3;
    }

    else if(isBetween4AMand6AM(time)){
        key = 18;
    }

    else if(isBetween7AMand9AM(time)){
        key = 15;
    }

    else if(isBetween10AMand12PM(time)){
        key = 12;
    }

    else if(isBetween1PMand3PM(time)){
        key = 9;
    }

    else if(isBetween4PMand6PM(time)){
        key = 6;
    }

    else if(isBetween7PMand9PM(time)){
        key = 3;
    }

    let response = await fetch(`https://www.7timer.info/bin/astro.php?lon=${pos.coords.longitude}&lat=${pos.coords.latitude}&ac=0&unit=metric&output=json&tzshift=0`);
    let data = await response.json();

    let weatherConditions = [];

    for(let rec of data.dataseries){

        if(rec.timepoint === key){

            weatherConditions.push(rec);
        }
    }

    return weatherConditions;
    
}


function displayInfo(weather){

    let result = document.getElementById('result');
    
    let html = '';

    for(let rec of weather){
        if(rec.cloudcover >= 1 && rec.cloudcover <= 2){

            html += `
            <p class="nightsky-response">You will have perfect weather conditions for stargazing tonight &#x1F60A;</p>
            
            `;
        }
    
        else if(rec.cloudcover >= 3 && rec.cloudcover <= 5){
    
            html +=`
            <p class="nightsky-response">You will have good weather conditions for stargazing tonight</p>

            `;
        }
    
        else if(rec.cloudcover === 6){
    
            html += `
            <p class="nightsky-response">You will have acceptable weather conditions for stargazing tonight, you may not see the entire sky but most will be visible.</p>
            
            `;
        }
    
        else if(rec.cloudcover >= 7){
    
            html += `
            <p class="nightsky-response">Most of the sky will not be visible tonight due to heavy cloud cover. However, you can still enjoy the beauty of the sky through our website &#x1F601;</p>
            
            `;
        }



    }
    

    result.innerHTML = html;

}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("nightsky-btn").addEventListener("click", async () => {
        let time_string = await getTime();
        let weatherConditions = await useLocationandTime(time_string);
        displayInfo(weatherConditions);
    });
});

