"use client"
import React, { useEffect, useState, useCallback } from 'react'
import IconExtendedZone from './IconExtendedZone'
import IconListZone from './IconListZone'
import { useQuery } from "@tanstack/react-query"
import FolderWorkSpaceCreation from './FolderWorkSpaceCreation'

function SideBar({navIconWidth, navFolderWidth, setFileToDisplay, setPageToDisplay, handleMouseDown}) {
  
  const [displayFolderCreation, setDisplayFolderCreation] = useState<boolean>(false)
  const [folderPath, setFolderPath] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const { data, isFetching, isError, refetch } = useQuery<any>({
    queryKey: ['createFolderWorkSpace'],
    queryFn: async () => {
        return new Promise((resolve, reject) => {
            const handleCreateFolderWorkSpace = (event, args) => {
                resolve(args);
                // Cleanup: remove the listener after resolving
                window.electron.stopReceiveCreateFolderWorkSpace(handleCreateFolderWorkSpace);
            };

            window.electron.receiveCreateFolderWorkSpace(handleCreateFolderWorkSpace);
            window.electron.createFolderWorkSpace({
                folderPath : folderPath,

            });

            // Optional: Setup a timeout or some mechanism to reject the promise if it takes too long
        });
    },
    refetchOnWindowFocus: false,
    enabled: false
  })

  useEffect(() => {
    console.log('Data updated:', data);
  }, [data]);

  const createFolderWorkSpace = async () => {
    setDisplayFolderCreation(false)
    await refetch();
  }

  useEffect(() => {
    // @ts-ignore
    const cleanup = window.electron.on('loading-progress', (newProgress) => {
      console.log('newProgress\n', newProgress);
      
      setProgress(newProgress);
    });

    // Clean up the listener when the component unmounts
    return () => cleanup();
  }, []);

  return (
    <>
        <IconListZone navIconWidth={navIconWidth} setDisplayFolderCreation={setDisplayFolderCreation}/>
        <IconExtendedZone navFolderWidth={navFolderWidth} data={data} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay} handleMouseDown={handleMouseDown}/>
        {displayFolderCreation &&
                <FolderWorkSpaceCreation 
                setDisplayFolderCreation={setDisplayFolderCreation}
                data={data}
                createFolderWorkSpace={createFolderWorkSpace}
                setFolderPath={setFolderPath}
                setSelectedLanguage={setSelectedLanguage}
                selectedLanguage={selectedLanguage}
                />}
    
    </>
  )
}

export default SideBar