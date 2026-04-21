"use client";

import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["JPG", "PNG", "GIF"];

export default function DragDrop() {
  const [file, setFile] = useState<string | null>(null);
  
  const handleChange = (uploadedFile: any) => {
    setFile(URL.createObjectURL(uploadedFile));
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h3>GeeksforGeeks - File Dropper</h3>
      <FileUploader 
        handleChange={handleChange} 
        name="file" 
        types={fileTypes} 
      />
      
      {file && (
        <div style={{ marginTop: "20px" }}>
          <h4>Image Preview:</h4>
          <img 
            src={file} 
            alt="Uploaded Preview" 
            style={{ maxWidth: "100%", height: "auto" }} 
          />
        </div>
      )}
    </div>
  );
}