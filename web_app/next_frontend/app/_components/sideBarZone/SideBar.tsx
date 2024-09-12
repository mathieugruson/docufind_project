"use client"
import React, { useEffect, useState, useCallback } from 'react'
import IconExtendedZone from './IconExtendedZone'
import IconListZone from './IconListZone'
import { useQuery } from "@tanstack/react-query"
import FolderWorkSpaceCreation from './FolderWorkSpaceCreation'

// @ts-ignore
function SideBar({menuWidth, handleMouseDown}) {
  
  const [displayFolderCreation, setDisplayFolderCreation] = useState<boolean>(false)
  const [folderPath, setFolderPath] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const [dirHandle, setDirHandle] = useState(null);
  const [fileHandle, setFileHandle] = useState(null);
  
  const { data, isFetching, isError, refetch } = useQuery<any>({
    queryKey: ['createFolderWorkSpace'],
    queryFn: async () => {
        return new Promise((resolve, reject) => {
          // @ts-ignore
            const handleCreateFolderWorkSpace = (event, args) => {
                resolve(args);
                // Cleanup: remove the listener after resolving
            };


            // Optional: Setup a timeout or some mechanism to reject the promise if it takes too long
        });
    },
    refetchOnWindowFocus: false,
    enabled: false
  })

  const openFolderPicker = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Destructure the one-element array to get the first selected file handle.
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker({mode: 'readwrite'});
        for await (const entry of dirHandle.values()) {
          console.log(entry.kind, entry.name);
        }
        setDirHandle(dirHandle);
        // Now you can do something with the file handle, like reading the file
      } catch (err) {
        // Handle cancellation or error
        console.error('File picker error:', err);
      }
    }
  };


  useEffect(() => {
    console.log('Data updated:', data);
  }, [data]);

  const createFolderWorkSpace = async () => {
    setDisplayFolderCreation(false)
    openFolderPicker()
    // await refetch();
  }

  return (
    <>
        <IconListZone menuWidth={menuWidth} setDisplayFolderCreation={setDisplayFolderCreation}/>
        {/* ON VA METTRE LE COMPOSANT CI-DESSOUS DANS LE PDF VIEWER AVEC UN CLICK BUTTON */}
        {/* <IconExtendedZone menuWidth={menuWidth} data={data} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay} handleMouseDown={handleMouseDown}/>
        {displayFolderCreation &&
                <FolderWorkSpaceCreation 
                setDisplayFolderCreation={setDisplayFolderCreation}
                data={data}
                createFolderWorkSpace={createFolderWorkSpace}
                setFolderPath={setFolderPath}
                setSelectedLanguage={setSelectedLanguage}
                selectedLanguage={selectedLanguage}
                openFolderPicker={openFolderPicker}
                />} */}
    
    </>
  )
}

export default SideBar