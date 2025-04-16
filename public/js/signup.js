import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { auth } from './firebaseIn.js';

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
        alert("Account Created... Please login with same credentials");

    })

    .catch((error) => {
        const errorCode = error.code;

        if(errorCode === "auth/email-already-in-use"){

          alert("This email is already registered. Please login instead.");
          
        }
        
    });


  })