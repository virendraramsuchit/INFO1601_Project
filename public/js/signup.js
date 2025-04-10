import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { firebaseConfig } from './firebaseConfig.js';

const app = initializeApp(firebaseConfig); 
  const auth = getAuth(app); 


  const signup = document.getElementById('signup');
  signup.addEventListener("click", function(event){

    event.preventDefault()
    
    //inputs
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password-signup').value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        alert("Account Created");

        //sends users to a new page after account was created
        window.location.href = "";
        // ..

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage)
        // ..
    });


  })