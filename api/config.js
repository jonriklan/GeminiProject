const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyAcKLHwP_Z7UBHR7PoplAgbc7UGHLCVZKM",
  authDomain: "gemini-420917.firebaseapp.com",
  projectId: "gemini-420917",
  storageBucket: "gemini-420917.appspot.com",
  messagingSenderId: "860472482408",
  appId: "1:860472482408:web:72703576965eef4c77f9dd",
  measurementId: "G-D0P2GM71MH"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Image = db.collection("Images");
module.exports = Image;
