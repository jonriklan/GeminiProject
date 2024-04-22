const admin = require("firebase-admin");
const serviceAccount = require('./secrets/gemini-420917-firebase-adminsdk-jyebc-cb3d36c251.json');
const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  apiKey: "AIzaSyAcKLHwP_Z7UBHR7PoplAgbc7UGHLCVZKM",
  authDomain: "gemini-420917.firebaseapp.com",
  projectId: "gemini-420917",
  storageBucket: "gemini-420917.appspot.com",
  messagingSenderId: "860472482408",
  appId: "1:860472482408:web:72703576965eef4c77f9dd",
  measurementId: "G-D0P2GM71MH"
};
admin.initializeApp(firebaseConfig);
const db = admin.firestore();
const Image = db.collection("Images");
module.exports = Image;
