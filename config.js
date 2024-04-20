const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Image = db.collection("Images");
module.exports = Image;
