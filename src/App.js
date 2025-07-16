import React, { useState } from "react";
import UploadRoom from "./components/UploadRoom";
import FurniturePanel from "./components/FurniturePanel";
import "./App.css";

function App() {
  const [roomImage, setRoomImage] = useState(null);
  const [furnitureItems, setFurnitureItems] = useState([]);

  const addFurniture = (item) => {
    setFurnitureItems([
      ...furnitureItems,
      { ...item, x: 50, y: 50, id: Date.now() },
    ]);
  };

  const handleDrag = (e, index) => {
    const updatedItems = [...furnitureItems];
    updatedItems[index].x = e.clientX - 50;
    updatedItems[index].y = e.clientY - 50;
    setFurnitureItems(updatedItems);
  };

  return (
    <div className="App">
      <h1>FurniFit 🛋️</h1>
      <UploadRoom setRoomImage={setRoomImage} />
      <FurniturePanel addFurniture={addFurniture} />

      {roomImage && (
        <div className="room-preview">
          <img src={roomImage} alt="Room Preview" className="room-image" />
          {furnitureItems.map((item, index) => (
            <img
              key={item.id}
              src={item.src}
              alt=""
              className="furniture-placed"
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: "80px",
                cursor: "move",
              }}
              draggable
              onDragEnd={(e) => handleDrag(e, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;


