import React from "react";

function FurnitureItem({ item, onClick }) {
  const handleClick = () => {
    onClick(item);
  };

  return (
    <img
      src={item.src}
      alt={item.id}
      className="furniture-thumbnail"
      onClick={handleClick}
    />
  );
}

export default FurnitureItem;
