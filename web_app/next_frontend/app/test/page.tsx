'use client'
import React, { useState } from 'react';

const FolderInput = () => {
  // State to store the list of files
  const [filesList, setFilesList] = useState<any[]>();
  const [fileContents, setFileContents] = useState('');

  // Handler for when a folder is selected
  const handleFolderChange = (event : any) => {
    const files = event.target.files;
    const fileList = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      console.log('files\n', files[i]);
      console.log('files name\n', files[i].name);
      console.log('files webkitRelativePath\n', files[i].webkitRelativePath);

      fileList.push(files[i].webkitRelativePath || files[i].name);
    }

    if (files.length > 0) {
        const file = files[0]; // Let's read only the first file for simplicity
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target !== null) {
                //@ts-ignore
              setFileContents(e.target.result);
            }
          };
          reader.readAsText(file);
          console.log('reader\n', reader);
          console.log(file);
          reader.onload = function() {
            console.log('result\n', reader.result);
          };
        
          reader.onerror = function() {
            console.log('error\n', reader.error);
          };  
    }

    // Update state
    setFilesList(fileList);
  };

  // @ts-ignore
  return (
    <div>
      <input type="file" webkitdirectory="true" directory="true" multiple onChange={handleFolderChange} />
      <ul>
        {filesList?.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default FolderInput;