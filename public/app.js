// Firebase Config (replace with your own config from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyA_fSL1piT6dBlJdPUqmHSwYxanbY7xhcs",
  authDomain: "phoenix-chatting.firebaseapp.com",
  projectId: "phoenix-chatting",
  storageBucket: "phoenix-chatting.firebasestorage.app",
  messagingSenderId: "525296549399",
  appId: "1:525296549399:web:aebe69b04c3fe4e67de652",
  measurementId: "G-PRGGY4FPZW"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

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

function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .catch(error => console.error(error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => console.error(error.message));
}

function logout() {
  auth.signOut();
}

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

