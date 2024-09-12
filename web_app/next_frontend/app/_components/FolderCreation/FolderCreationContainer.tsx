import React, {useState, useEffect} from 'react'
import { FiFilePlus } from "react-icons/fi";
import ISO6391 from 'iso-639-1';
import EncryptionFilesToggle from './EncryptionFilesToggle';
import FolderName from './FolderName';
import DragNDrop from './DragNDrop';
import io from 'socket.io-client';
import LoadingBar from './LoadingBar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { useSession } from 'next-auth/react';
import getGoodPath from './library/getGoodPath';

const defaultSocketOptions : any = {
  'reconnection': true,
  'reconnectionDelay': 5000,
  'reconnectionDelayMax' : 5000,
  'timeout' : 5000,
  'retries': 3,
  'ackTimeout': 3000,
  // 'pingTimeout': 2000,
}


interface FileStructure {
  [key: string]: File;
}

type loadingStatus = {
  status : string,
  fileName : string,
  totalPages : number
  pageTreated : number,
}

const socket = io(`http://localhost:${process.env.NEXT_PUBLIC_NGINX_PORT}/progress`, defaultSocketOptions)

// @ts-ignore
function FolderCreationContainer({docViewerWidth, setFileExplorerContent, setUserFolderResult}) {

  const { data: session, status } = useSession();
  const [folder, setFolder] = useState<any>()
  const [loadingInfos, setLoadingInfos] = useState<loadingStatus | undefined>(undefined)
  const [structure, setStructure] = useState<FileStructure>()
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [encryptionToggle, setEncryptionToogle] = useState(false)
  const [folderName, setFolderName] = useState('')
  const languageNativeNames = ISO6391.getAllNames();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };


  useEffect(() => {

    const fetchData = async () => {
      try {
        const endpoint = 'back_api/folder-creation/serve-directory'; // Replace with your actual endpoint
          
        const response = await fetch(`${endpoint}?folder=${encodeURIComponent(folderName)}`, {
          method: 'GET',
          headers: {
            authorization : `Bearer ${session?.backendTokens.accessToken}`
          },
        });
        const result = await response.json();
        console.log('Success: ', result);
        setFileExplorerContent(result.itemDirectoryResult);
  
      } catch (error) {
        console.error('Error:', error);
        // Optionally, break the loop or handle retries for the failed upload
      }    
    };
  
    socket.on('progress', (data : any) => {
      console.log('progress\n', data); // Or update a state to display the progress in the UI
      if (data && data.status === 'succeed') {

        fetchData().catch(console.error); // Call the async function and catch any potential errors
      }
  
      setLoadingInfos(data);
    });
  
    return () => {
      socket.off('progress');
    };
  }, [folderName, session]);

  useEffect(() => {

    if (folder && folder.length > 0) {
      // const firstFilePath = folder[0].webkitRelativePath;
      // const firstFolderName = firstFilePath.split('/')[0]; // Assumes folder name is the first part of the path
      // setFolderName(firstFolderName);

      const structure: FileStructure = {}; // Now TypeScript knows what structure is
  
      for (let i = 0; i < folder.length; i++) {
        const file = folder[i];
        console.log('file structure creation\n', file);
        
        // Here, `webkitRelativePath` gives the relative path including the folder structure
        

        if (file.webkitRelativePath == '') {
          structure[i] = file;
        } else {
          structure[file.webkitRelativePath] = file;
        }
      
      }

      setStructure(structure)
      console.log('structure\n', structure);

    }
    return () => {
    }
  }, [folder])

  
  const uploadFilesIndividually = async (e: any) => {

    console.log('session\n', session);
    

    for (const path in structure) {
      const formData = new FormData();

      formData.append('file', structure[path]);
      
      const goodPath = getGoodPath(path, folderName)

      console.log('\ngoodPath\n', goodPath);
      

      try {
        const endpoint = 'back_api/folder-creation/files'; // Replace with your actual endpoint
        console.log('session?.backendTokens.accessToken\n', session?.backendTokens.accessToken);
        
        const response = await fetch(`${endpoint}?path=${encodeURIComponent(goodPath)}`, {
          method: 'POST',
          headers: {
            authorization : `Bearer ${session?.backendTokens.accessToken}`
          },
          body: formData,
        });

        console.log('response\n', response);
        
        const result = await response.json();
        console.log('Success: YO', result);
      } catch (error) {
        console.error('Error fetch:', error);
        // Optionally, break the loop or handle retries for the failed upload
      }
    }

    // DONE changer le fetch par une socket car ça time-out sinon !
    // https://stackoverflow.com/questions/71511467/fetch-api-increase-timeout
    /*
    https://stackoverflow.com/questions/46946380/fetch-api-request-timeout/49857905#49857905
    Using a promise race solution will leave the request hanging and still consume bandwidth
    in the background and lower the max allowed concurrent request being made while it's still in process.
    = BAD FOR PERFORMANCE SO FETCH AND RETURN 201 AND FETCH ELSEWHERE WHEN IT'S FINISH
    */
    try {
      const endpoint = 'back_api/folder-creation/process-directory'; // Replace with your actual endpoint
      console.log('folderName\n', folderName);

      // RESET ALL DATA AS WE CREATE A NEW FOLDER (DEPLACE IT LATER TO THE CLICK TO CREATE NEW FOLDER)
      localStorage.setItem('currentFolderUuid', '');
      localStorage.setItem('currentQuestionUuid', '');
      localStorage.setItem('currentConversationUuid', '');

      const response = await fetch(`${endpoint}?folder=${encodeURIComponent(folderName)}`, {
        method: 'GET',
        headers: {
          authorization : `Bearer ${session?.backendTokens.accessToken}`
        },
      });
      const result = await response.json();
      console.log('Success: ', result);
      setFileExplorerContent(result.itemDirectoryResult);
      setUserFolderResult(result.userFolderResult);
      localStorage.setItem('currentFolderUuid', result.userFolderResult.id);

      // TODO : save ds localItem 
    } catch (error) {
      console.error('Error:', error);
      // Optionally, break the loop or handle retries for the failed upload
    }    
    

    // WHEN IT MANAGE TO SUCCESSFULLY SEND THE DOCS TO THE SERVER, I WOULD LIKE TO SAVE THE NAME OF THE FOLDER
    // IN THE BROWSER DB HERE
    localStorage.setItem('currentFolder', folderName);

  }

  return (
    <>
    <div
        id="zone_creation_dossier"
        style={{ width: `${docViewerWidth}px`, overflow: `overlay` }}
        className='relative h-[calc(100%-32px)] bg-[#202124] flex  justify-center items-center rounded-lg'>    
          <div
          id="pop-up_creation_dossier"
          className='flex flex-col h-2/3 w-2/3 bg-pink-500 rounded-lg justify-between'>
            <DragNDrop setFolder={setFolder} setFolderName={setFolderName}/>
            <div id="folder_name">
            </div>
            <FolderName setFolderName={setFolderName} folderName={folderName} />
            <div 
            id="select_language_container"
            className='flex flex-row  items-center m-2'>
              <div className='pr-2'>Langue du dossier</div>
              <select className='bg-[#292a2d] w-[160px] hover:bg-[#38393b] rounded-lg p-1' value={selectedLanguage} onChange={handleChange}>
            <option className='bg-[#292a2d]' value="">Select a language</option>
              {languageNativeNames.map((name, index) => (
                  <option key={name} value={name}>
                {name}
              </option>
            ))}
              </select>
            </div>
            <EncryptionFilesToggle setEncryptionToogle={setEncryptionToogle} encryptionToggle={encryptionToggle}/>
            <div
            id='zone_button_creation'
            className='flex justify-center items-center m-2 pb-2 hover:bg-[#38393b]'
            onClick={uploadFilesIndividually}
            >Creer le dossier</div>
            <LoadingBar loadingInfos={loadingInfos}/>
          </div>
        </div>
    </>
  )
}

export default FolderCreationContainer

