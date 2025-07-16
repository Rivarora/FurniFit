import React, { useState, useEffect, useRef } from "react";
import UploadRoom from "./components/UploadRoom";
import FurniturePanel from "./components/FurniturePanel";
import "./App.css";
import html2canvas from "html2canvas";

function App() {
  const [roomImage, setRoomImage] = useState(null);
  const roomRef = useRef(null);

  // Undo/Redo history stacks
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Furniture items state
  const [furnitureItems, setFurnitureItems] = useState(() => {
    const saved = localStorage.getItem("furnifit-layout");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Saved rooms state: multiple named layouts
  const [savedRooms, setSavedRooms] = useState(() => {
    const saved = localStorage.getItem("furnifit-rooms");
    return saved ? JSON.parse(saved) : {};
  });

  // Currently loaded room name (if any)
  const [currentRoomName, setCurrentRoomName] = useState("");

  // Save layout to localStorage whenever furnitureItems change
  useEffect(() => {
    localStorage.setItem("furnifit-layout", JSON.stringify(furnitureItems));
  }, [furnitureItems]);

  // Push current furnitureItems state to history for undo, clear redo stack
  const pushToHistory = (newFurnitureItems) => {
    setHistory((h) => [...h, furnitureItems]);
    setRedoStack([]);
    setFurnitureItems(newFurnitureItems);
  };
  const [snapToGrid, setSnapToGrid] = useState(true); // NEW toggle state
  // Add furniture with history tracking
  const addFurniture = (item) => {
    const newFurniture = [
      ...furnitureItems,
      {
        ...item,
        id: Date.now(),
        x: 100,
        y: 100,
        width: 80,
        rotation: 0,
      },
    ];
    pushToHistory(newFurniture);
  };

  const GRID_SIZE = 20;

  // Drag with snap to grid with history tracking
  const handleDrag = (e, index) => {
    const updatedItems = [...furnitureItems];
    const rect = e.target.parentNode.getBoundingClientRect();

    let newX = e.clientX - rect.left - 40;
    let newY = e.clientY - rect.top - 40;

    newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
    newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

    updatedItems[index].x = newX;
    updatedItems[index].y = newY;

    pushToHistory(updatedItems);
  };

  // Rotate furniture with history
  const rotateItem = (index) => {
    const updated = [...furnitureItems];
    updated[index] = {
      ...updated[index],
      rotation: updated[index].rotation + 15,
    };
    pushToHistory(updated);
  };

  // Resize furniture with history
  const resizeItem = (index, delta) => {
    const updated = [...furnitureItems];
    updated[index] = {
      ...updated[index],
      width: Math.max(30, updated[index].width + delta),
    };
    pushToHistory(updated);
  };

  // Delete furniture with history
  const deleteItem = (index) => {
    const updated = [...furnitureItems];
    updated.splice(index, 1);
    pushToHistory(updated);
  };

  // Clear layout with history
  const clearLayout = () => {
    setHistory((h) => [...h, furnitureItems]);
    setRedoStack([]);
    setFurnitureItems([]);
    setRoomImage(null);
    setCurrentRoomName("");
    localStorage.removeItem("furnifit-layout");
  };

  // Undo action
  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    setRedoStack((r) => [furnitureItems, ...r]);
    setFurnitureItems(previous);
  };

  // Redo action
  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [...h, furnitureItems]);
    setFurnitureItems(next);
  };

  // Export room as image
  const exportAsImage = () => {
    if (!roomRef.current) return;

    setTimeout(() => {
      html2canvas(roomRef.current, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        scale: 2,
      })
        .then((canvas) => {
          const link = document.createElement("a");
          link.download = "furnifit-room.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        })
        .catch((err) => {
          console.error("Export failed:", err);
          alert("Failed to export the layout. Check console for details.");
        });
    }, 500);
  };

  // --- Multiple rooms feature ---

  // Save current layout as a named room
  const saveCurrentRoom = () => {
    const name = prompt("Enter a name for this room layout:");
    if (!name) return alert("Room name is required.");

    const newSavedRooms = {
      ...savedRooms,
      [name]: {
        roomImage,
        furnitureItems,
      },
    };

    setSavedRooms(newSavedRooms);
    setCurrentRoomName(name);
    localStorage.setItem("furnifit-rooms", JSON.stringify(newSavedRooms));
    alert(`Room "${name}" saved!`);
  };

  // Load a saved room by name
  const loadRoom = (name) => {
    if (!name) return;
    const room = savedRooms[name];
    if (!room) return alert("Room not found.");

    setRoomImage(room.roomImage);
    setFurnitureItems(room.furnitureItems);
    setCurrentRoomName(name);
    setHistory([]);
    setRedoStack([]);
  };

  // Delete saved room by name
  const deleteRoom = (name) => {
    if (!name) return;
    if (!window.confirm(`Delete room "${name}"? This action cannot be undone.`))
      return;

    const newSavedRooms = { ...savedRooms };
    delete newSavedRooms[name];

    setSavedRooms(newSavedRooms);

    if (name === currentRoomName) {
      setRoomImage(null);
      setFurnitureItems([]);
      setCurrentRoomName("");
      setHistory([]);
      setRedoStack([]);
    }

    localStorage.setItem("furnifit-rooms", JSON.stringify(newSavedRooms));
  };

  return (
    <div className="App">
      <h1>FurniFit 🛋️</h1>

      <div style={{ marginBottom: 10 }}>
        <UploadRoom setRoomImage={setRoomImage} />
        <FurniturePanel addFurniture={addFurniture} />
        <label style={{ marginLeft: 10 }}>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />{" "}
          Snap to Grid
        </label>
        <button onClick={clearLayout} style={{ marginTop: "10px" }}>
          🧹 Clear Room
        </button>

        <button onClick={exportAsImage} style={{ marginLeft: "10px" }}>
          📸 Export Layout
        </button>
      </div>

      {/* Undo / Redo Buttons */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={undo} disabled={history.length === 0}>
          ↩️ Undo
        </button>
        <button onClick={redo} disabled={redoStack.length === 0} style={{ marginLeft: 10 }}>
          ↪️ Redo
        </button>
      </div>

      {/* Save / Load / Delete Room Layout */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={saveCurrentRoom}>💾 Save Layout</button>

        <select
          value={currentRoomName}
          onChange={(e) => loadRoom(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">-- Load Saved Room --</option>
          {Object.keys(savedRooms).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {currentRoomName && (
          <button
            onClick={() => deleteRoom(currentRoomName)}
            style={{ marginLeft: 10, color: "red" }}
          >
            🗑️ Delete Layout
          </button>
        )}
      </div>

      {/* Room preview */}
      {roomImage && (
        <div className="room-preview" ref={roomRef}>
          <img src={roomImage} alt="Room" className="room-image" />
          {furnitureItems.map((item, index) => (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={item.src}
                alt=""
                draggable
                onDragEnd={(e) => handleDrag(e, index)}
                style={{
                  width: item.width + "px",
                  transform: `rotate(${item.rotation}deg)`,
                  cursor: "move",
                }}
              />
              <div style={{ marginTop: 4 }}>
                <button onClick={() => rotateItem(index)}>🔄</button>
                <button onClick={() => resizeItem(index, +10)}>➕</button>
                <button onClick={() => resizeItem(index, -10)}>➖</button>
                <button onClick={() => deleteItem(index)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;









