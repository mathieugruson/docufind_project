import React from 'react';
import { FiFolderPlus } from "react-icons/fi";

function DragNDrop({ setFolder, setFolderName }: any) {

  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFolderButtonClick = () => {
    console.log('test2');
    folderInputRef.current.click();
  };

  return (
    <>
      <div
        id="zone_drag_drop"
        className='flex flex-col h-1/4 bg-blue-500 justify-start items-center'
      >
        <div id="select_folder_zone" className='flex flex-row w-full px-4 items-center'>
          <FiFolderPlus className='text-3xl m-2 flex'/>
          <div className='flex flex-col'>
            {/* Hidden file input for selecting a folder */}
            <input
              type="file"
              ref={folderInputRef}
              onChange={(e) => {
              console.log('test');
              if (e.target.files && e.target.files.length > 0) {
                console.log('e.target.files\n', e.target.files);
                const firstFilePath = e.target.files[0].webkitRelativePath;
                const firstFolderName = firstFilePath.split('/')[0]; // Assumes folder name is the first part of the path
                console.log('firstFolderName\n', firstFolderName);
                setFolderName(firstFolderName);
                setFolder(e.target.files)}}}
                required
                webkitdirectory=""
                directory=""
                multiple
              className="hidden"
            />
            {/* Visible label for folders */}
            <label
              onClick={handleFolderButtonClick}
              className='text-3xl cursor-pointer mt-4 hover:underline'
            >
              Sélectionnez un dossier
            </label>
            {/* Hidden file input for selecting files */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                console.log('e.target.files 2\n', e.target.files);
                setFolderName('');
                setFolder(e.target.files)}}
              multiple
              className="hidden"
            />
            {/* Visible label for files */}
            <label
              onClick={handleFileButtonClick}
              className='text-sm cursor-pointer hover:underline'
            >
              Choisissez un ou plusieurs fichiers
            </label>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default DragNDrop;