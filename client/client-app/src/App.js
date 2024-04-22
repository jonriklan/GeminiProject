
import {useState, useEffect} from 'react';
const API_BASE = "http://localhost:4000";

function App() {
const[images, setImages] = useState([]);
const [popupActive, setPopupActive] = useState(false);
const [newImage, setNewImage] = useState("");

useEffect(()=>{
  GetImages();
  console.log(images);
}, [])

const GetImages = ()=>{
  const data = fetch(API_BASE + "/").then(res =>res.json())
  .then(data=>setImages(data))
  .catch(err=>console.error("Error: " , err));

  
}


}

export default App;
