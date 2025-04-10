import { API_KEY } from './apikey.js';

let api_key = API_KEY.key;

//Test to make sure hidden API key works 
async function getData (){

    let response = await fetch(`https://api.nasa.gov/planetary/apod?&api_key=${api_key}`);
    let data = await response.json();
    return data;

}

let state = await getData();

function showData(info){

    console.log(`Title:${info.title} `);
    console.log(`Date:${info.date}`);

}

showData(state);

