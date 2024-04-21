const express = require("express");
const cors = require("cors");
const Image = require("./config");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  const snapshot = await Image.get();
  const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(list);
});

app.post("/create", async (req, res) => {
  const data = req.body;
  await Image.add({ data });
  res.send({ msg: "Image Added" });
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
