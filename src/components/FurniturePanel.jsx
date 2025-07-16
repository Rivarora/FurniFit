import React from "react";
import FurnitureItem from "./FurnitureItem";
import sofa from "../assets/sofa.png";
import chair from "../assets/chair.png";
import lamp from "../assets/lamp.png";



function FurniturePanel({ addFurniture }) {
  const items = [
    { id: "sofa", src: sofa },
    { id: "chair", src: chair },
    { id: "lamp", src: lamp },
  ];

  return (
    <div className="furniture-panel">
      <h3>Select Furniture</h3>
      <div className="furniture-list">
        {items.map((item) => (
          <FurnitureItem key={item.id} item={item} onClick={addFurniture} />
        ))}
      </div>
    </div>
  );
}

export default FurniturePanel;
