import { signInWithEmailAndPassword, } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
// import { firebaseConfig } from './firebaseConfig.js';
import { auth } from './firebaseIn.js';

  // const app = initializeApp(firebaseConfig); 
  // const auth = getAuth(app); 

  const login = document.getElementById('login');
  login.addEventListener("click", function(event){

    event.preventDefault()
    
    //inputs
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;


    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

        // Signed in
        const user = userCredential.user;
        alert("Logged In");

        //sends users to a new page after account was created
        window.location.href = "mainpage-landscape.html";
        

    })
    .catch((error) => {

        const errorCode = error.code;

        if (errorCode === "auth/invalid-credential") {
          alert("Email or password is incorrect.");
        } 
        else if (errorCode === "auth/invalid-email") {
          alert("Invalid email format.");
        } 
        else if (errorCode === "auth/too-many-requests") {
          alert("Too many login attempts. Try again later.");
        } 
        else {
          alert("Login failed: " + error.message);
        }
        
    });


})