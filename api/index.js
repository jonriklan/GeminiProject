const express = require("express");
const cors = require("cors");
const multer = require('multer');
const Image = require("./config");
const app = express();
const fs = require('fs');
app.use(express.json());
app.use(cors());
const path = require('path');
const admin = require("firebase-admin");
var firebasePath = require("firebase-admin");

const bucket = admin.storage().bucket();

// use dotenv for loading the environment variables
const dotenv = require("dotenv")
dotenv.config({
  path: "./.env" // environment file should be located in the same directory as the script
  // environment file should not be committed to the repository (upload manually through bucket)
  // environment file can be called whatever, but you need to change it here
})
const { GoogleGenerativeAI } = require("@google/generative-ai"); //need the gemini package
const genAI = new GoogleGenerativeAI(process.env.GEN_API_KEY); //assuming the environment variable is called GEN_API_KEY

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

app.post('/create', upload.single('file'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(400).send(req.fileValidationError);
  }

  if (!req.file) {
    return res.status(400).send('Please upload a file');
  }

  console.log(req.file);
  const localFile = req.file.path;
  firebasePath = `uploads/${req.file.filename}`;
  const fileUpload = bucket.file(firebasePath);

  // Uploads the file to Firebase Storage
  try {
    await fileUpload.save(localFile, {
      metadata: { contentType: req.file.mimetype }, // Automatically set based on file type
      public: true,
      validation: "md5"
    });

    const generativePart = await prompt(firebasePath, req.file.mimetype);
    // Call the prompt function here with the Firebase Storage file path and mimetype

    // After generating the generative part, delete the local file to avoid storage overflow
    
    fs.unlinkSync(localFile);


    return res.status(200).send({
      message: "File uploaded to Firebase Storage!",
      fileUrl: `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`, // Correct public URL for the file
      textResponse: generativePart // Include the generative part in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
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




function fileToGenerativePart(path, mimeType) { //function copied from their website
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
      // mimetype is the file type png or jpeg
      // it is a string that is either 'image/png' or 'image/jpeg' respectively
    },
  };
}
const nodePath = require("path");
async function prompt(path, imgtype) {
  const fileRef = bucket.file(firebasePath);
  
  // Temporary download location
  const tempDownloadPath = nodePath.join('/tmp', nodePath.basename(firebasePath));
  
  // Download file from Firebase Storage to temporary location
  await fileRef.download({destination: tempDownloadPath});

  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "Can you improve this image (offer suggestions like saturation, contrast, placement of objects, ...)";

  const imageParts = [
    fileToGenerativePart(path, imgtype),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();

  // Clean up the temporary file
  fs.unlinkSync(tempDownloadPath);

  return text;
}

app.listen(4000, () => console.log("Up & RUnning *4000"));
