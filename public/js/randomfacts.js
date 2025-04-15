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

function displayRandomSpaceFact() {
const spaceFacts = [
    "NASA was established in 1958.",
    "The first person on the moon was Neil Armstrong in 1969.",
    "Jupiter has 79 known moons!",
    "The Sun makes up 99.8% of the mass of our Solar System.",
    "Mars is home to the tallest mountain in the solar system: Olympus Mons.",
    "The ISS travels at 28,000 kilometers per hour.",
    "Venus is the hottest planet in our solar system, not Mercury.",
    "Space is completely silent – there’s no atmosphere for sound to travel."
  ];

  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  const randomFact = spaceFacts[randomIndex];
  const factElement = document.getElementById("spaceFact");
  factElement.textContent = "🌌 " + randomFact;
}