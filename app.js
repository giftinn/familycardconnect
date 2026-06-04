import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCLpCSAshpUvtNpY_FCr56GAV5SRYUyETg",
  authDomain: "family-card-connect.firebaseapp.com",
  projectId: "family-card-connect",
  storageBucket: "family-card-connect.firebasestorage.app",
  messagingSenderId: "865520540704",
  appId: "1:865520540704:web:4cb463778c7ba9416ef045",
  measurementId: "G-THBM8W0142"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


function getCurrentUser() {
  return sessionStorage.getItem("currentUser");
}

function redirectIfNotLoggedIn() {
  if (!getCurrentUser()) {
    window.location.href = "index.html";
  }
}

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const username = document
      .getElementById("username")
      .value.trim()
      .toLowerCase();

    const errorMsg = document.getElementById("errorMsg");

    if (!username) {
      errorMsg.textContent = "Nama tidak boleh kosong.";
      return;
    }

    const userRef = doc(db, "users", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        level: 1,
        openedCards: [],
        createdAt: new Date()
      });
    }

    sessionStorage.setItem("currentUser", username);
    window.location.href = "mechanism.html";
  });
}

/* ================= MECHANISM PAGE ================= */

if (window.location.pathname.includes("mechanism.html")) {

  redirectIfNotLoggedIn();

  const username = getCurrentUser();
  const welcomeText = document.getElementById("welcomeText");

  if (welcomeText && username) {
    welcomeText.textContent =
      `Halo ${username}, sebelum kita mulai, berikut cara bermain Family Connect Card.`;
  }

  const startGameBtn = document.getElementById("startGameBtn");

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      window.location.href = "game.html";
    });
  }
}

/* ================= GAME PAGE ================= */

if (window.location.pathname.includes("game.html")) {

  redirectIfNotLoggedIn();

  const username = getCurrentUser();
  const userRef = doc(db, "users", username);

  const gameCard = document.getElementById("gameCard");

  const frontImage = document.getElementById("frontImage");
  const backImage = document.getElementById("backImage");

  const remainingText = document.getElementById("remainingCards");
  const nextBtn = document.getElementById("nextBtn");
  const levelTitle = document.getElementById("levelTitle");

  const totalCards = 8;
  const maxLevel = 3;

  let currentLevel = 1;
  let openedCards = [];
  let currentCardNumber = null;

  function createFirework() {

  const colors = [
    "#ffffff",
    "#C8D9E6",
    "#A5BFCC",
    "#8DA9C4",
    "#F5EFEB"
  ];

  const firework = document.createElement("div");

  firework.classList.add("firework");

  firework.style.background =
    colors[Math.floor(Math.random() * colors.length)];

  firework.style.left =
    Math.random() * window.innerWidth + "px";

  firework.style.top =
    Math.random() * window.innerHeight + "px";

  document.body.appendChild(firework);

  setTimeout(() => {
    firework.remove();
  }, 1500);
}

function showEndingScreen() {

  const endingScreen =
    document.getElementById("endingScreen");

  if (!endingScreen) return;

  endingScreen.classList.add("show");

  for (let i = 0; i < 35; i++) {

    setTimeout(() => {

      createFirework();

    }, i * 120);

  }
}

  async function loadProgress() {

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      currentLevel = data.level || 1;
      openedCards = data.openedCards || [];
    }

    renderCard();
  }

  function renderCard() {

    levelTitle.textContent = `Level ${currentLevel}`;

    const remaining = totalCards - openedCards.length;

    remainingText.textContent = remaining;

    if (remaining === 0) {

      gameCard.style.display = "none";

      nextBtn.style.display = "block";

      if (currentLevel < maxLevel) {
        nextBtn.textContent = "Lanjut Level";
      } else {
        nextBtn.textContent = "Finish The Game 🎉";
      }

      return;
    }

    gameCard.style.display = "block";

    gameCard.classList.remove("flipped");

    nextBtn.style.display = "none";

    currentCardNumber = null;

    for (let i = 1; i <= totalCards; i++) {

      if (!openedCards.includes(i)) {

        currentCardNumber = i;
        break;
      }
    }

    if (!currentCardNumber) return;

    frontImage.src =
      `images/level${currentLevel}/card${currentCardNumber}-front.png`;

    backImage.src =
      `images/level${currentLevel}/card${currentCardNumber}-back.png`;
  }

  gameCard.addEventListener("click", () => {

    if (gameCard.classList.contains("flipped")) return;

    gameCard.classList.add("flipped");

    nextBtn.style.display = "block";

    nextBtn.textContent = "Kartu Berikutnya";
  });

  nextBtn.addEventListener("click", async () => {

    const remaining = totalCards - openedCards.length;

    if (
      remaining > 0 &&
      nextBtn.textContent === "Kartu Berikutnya"
    ) {

      if (!openedCards.includes(currentCardNumber)) {
        openedCards.push(currentCardNumber);
      }

      await updateDoc(userRef, {
        level: currentLevel,
        openedCards: openedCards,
        updatedAt: new Date()
      });

      renderCard();
    }

    else if (remaining === 0) {

      if (currentLevel < maxLevel) {

        currentLevel++;

        openedCards = [];

        await updateDoc(userRef, {
          level: currentLevel,
          openedCards: [],
          updatedAt: new Date()
        });

        renderCard();

      } else {

        showEndingScreen();

      }
    }
  });

  loadProgress();
}