const express = require("express");
const cors = require("cors");
const multer = require('multer');
//const upload = multer({ dest: 'uploads/' });
const Image = require("./config");
const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');
const admin = require("firebase-admin");

const bucket = admin.storage().bucket();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.get("/", async (req, res) => {
  const snapshot = await Image.get();
  const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(list);
});

app.post('/create', upload.single('file'), (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }

  if (!req.file) {
    return res.status(400).send('Please upload a file');
  }

  console.log(req.file);
  const localFile = req.file.path;
  const fileUpload = bucket.file(req.file.originalname);

  // Uploads the file to Firebase Storage
  fileUpload.save(localFile, {
    metadata: { contentType: req.file.mimetype }, // Automatically set based on file type
    public: true,
    validation: "md5"
  }).then(() => {
    // After upload, delete the local file to avoid storage overflow
    const fs = require('fs');
    fs.unlinkSync(localFile);

    return res.status(200).send({
      message: "File uploaded to Firebase Storage!",
      fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}` // Correct public URL for the file
    });
  }).catch(error => {
    console.error(error);
    res.status(500).send(error);
  });
});

app.post("/update", async (req, res) => {
  const id = req.body.id;
  delete req.body.id;
  const data = req.body;
  await Image.doc(id).update(data);
  res.send({ msg: "Updated" });
});

app.post("/delete", async (req, res) => {
  const id = req.body.id;
  await Image.doc(id).delete();
  res.send({ msg: "Deleted" });
});

app.listen(4000, () => console.log("Up & RUnning *4000"));
