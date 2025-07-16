import React from "react";

function UploadRoom({ setRoomImage }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setRoomImage(imageUrl);
    }
  };

  return (
    <div className="upload-room">
      <label htmlFor="roomInput">Upload your room:</label>
      <input
        type="file"
        id="roomInput"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
}

export default UploadRoom;
