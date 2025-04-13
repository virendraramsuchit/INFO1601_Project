
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

import { firebaseConfig } from './firebaseConfig.js';

// Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function showComments(){

    


}