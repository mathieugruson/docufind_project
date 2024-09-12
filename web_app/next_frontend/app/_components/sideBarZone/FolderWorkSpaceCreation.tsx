"use client"
import React, { useEffect, useState } from 'react'
import { CiCirclePlus } from "react-icons/ci";
import { FaTimes } from 'react-icons/fa';
import { useQuery } from "@tanstack/react-query"
import ISO6391 from 'iso-639-1';

function FolderWorkSpaceCreation(props : {
    setDisplayFolderCreation : any,
    data : any,
    createFolderWorkSpace : any,
    setFolderPath : any,
    setSelectedLanguage : any,
    selectedLanguage : any,
    openFolderPicker : any
}) {

    // fetch qui permet d'avoir le path 
    const { data, isFetching, isError, refetch } = useQuery<any>({
        queryKey: ['folderPath'],
        queryFn: async () => {
            return new Promise((resolve, reject) => {
                const handleSetFolderPathString = (_event : any, _args : any) => {
                    resolve(args);
                    // Cleanup: remove the listener after resolving
                };

                // Optional: Setup a timeout or some mechanism to reject the promise if it takes too long
            });
        },
        refetchOnWindowFocus: false,
        enabled: false
    })

    const languageNativeNames = ISO6391.getAllNames();

    const getFolderPath = async () => {
        // await refetch();
        const test = await props.openFolderPicker()
        console.log('test\n', test);
        
        
        props.setFolderPath(data)
    };

    useEffect(() => {
        props.setFolderPath(data)
    }, [data])

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        props.setSelectedLanguage(event.target.value);
      };
    

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm '>
        <div className='relative flex flex-col p-2 bg-[#292a2d] rounded-lg'>
        <div className='flex justify-end'>
            <div className='flex m-2 hover:bg-[#38393b] rounded-lg p-1 w-[25px]'>
                <FaTimes onClick={() => {
                    props.setDisplayFolderCreation(false)
                }}/>
            </div>
        </div>
        <div className='flex flex-row  items-center m-2'>
            <CiCirclePlus className='text-2xl mr-2  items-center' onClick={getFolderPath} />
            {data && <div className=' items-center'>{data}</div>}
            {!data && <div className=' items-center'>Aucun dossier selectionne pour l'instant</div>} 
        </div>
        <div className='flex flex-row  items-center m-2'>
        <div className='pr-2'>Langue du dossier</div>
        <select className='bg-[#292a2d] w-[160px] hover:bg-[#38393b] rounded-lg p-1' value={props.selectedLanguage} onChange={handleChange}>
      <option className='bg-[#292a2d]' value="">Select a language</option>
        {languageNativeNames.map((name, index) => (
            <option key={name} value={name}>
          {name}
        </option>
      ))}
        </select>
      </div>
        <div></div>
        <div className="flex justify-center items-center hover:bg-blue-700 text-white rounded mt-2" onClick={props.createFolderWorkSpace}>
                Creer le dossier
        </div>
        </div>
    </div>
  )
}

export default FolderWorkSpaceCreation