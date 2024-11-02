// Firebase Config (use your provided configuration)
const firebaseConfig = {
  apiKey: "AIzaSyA_fSL1piT6dBlJdPUqmHSwYxanbY7xhcs",
  authDomain: "phoenix-chatting.firebaseapp.com",
  projectId: "phoenix-chatting",
  storageBucket: "phoenix-chatting.appspot.com", // Corrected bucket URL
  messagingSenderId: "525296549399",
  appId: "1:525296549399:web:aebe69b04c3fe4e67de652",
  measurementId: "G-PRGGY4FPZW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Monitor authentication state
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "block";
    loadMessages();
  } else {
    document.getElementById("authContainer").style.display = "block";
    document.getElementById("chatContainer").style.display = "none";
  }
});

// Registration function
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      console.log("User registered:", email);
      alert("Registration successful! You can now log in.");
    })
    .catch(error => {
      console.error("Error registering:", error.message);
      alert(error.message);
    });
}

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("Logged in as:", userCredential.user.email);
    })
    .catch(error => {
      console.error("Error logging in:", error.message);
      alert(error.message); // Alert the user for better visibility
    });
}

// Logout function
function logout() {
  auth.signOut();
}

// Load messages function
function loadMessages() {
  db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    snapshot.forEach(doc => {
      const message = doc.data();
      const li = document.createElement("li");
      li.textContent = `${message.user}: ${message.text}`;
      messages.appendChild(li);
    });
  });
}

// Send message function
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value;
  if (message) {
    db.collection("messages").add({
      text: message,
      user: auth.currentUser.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageInput.value = "";
  }
}

// Send file function
function sendFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (file) {
    const storageRef = storage.ref().child(`files/${file.name}`);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        db.collection("messages").add({
          text: `📎 Sent a file: ${url}`,
          user: auth.currentUser.email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
    });
    fileInput.value = "";
  }
}
