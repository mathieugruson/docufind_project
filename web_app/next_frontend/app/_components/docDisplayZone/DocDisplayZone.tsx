import React, {useEffect, useState} from 'react'
import HeaderDocDisplay from './HeaderDocDisplay'
import PdfDisplay from './PdfDisplay'

import FolderCreationContainer from '../FolderCreation/FolderCreationContainer';
import NestedFileExplorer from './NestedFileExplorer';

function DocDisplayZone({fileToDisplay, docViewerWidth, setFileToDisplay, setPageToDisplay, handleMouseDown, setUserFolderResult} : any) {

  const [numPages, setNumPages] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const [fileExplorerContent, setFileExplorerContent] = useState<any>()
  const [displayFileExplorer, setDisplayFileExplorer] = useState(false)

  return (
    <div className='relative h-full bg-[#202124]'>
        <div
            style={{ right: `${docViewerWidth}px`}}
            className='absolute z-10 bg-[#858585] bottom-0 cursor-nwse-resize h-full w-[2px]'
            onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e);
            }}
        ></div>
        <HeaderDocDisplay fileToDisplay={fileToDisplay} docViewerWidth={docViewerWidth} numPages={numPages} setZoomLevel={setZoomLevel} currentPage={currentPage} setDisplayFileExplorer={setDisplayFileExplorer} displayFileExplorer={displayFileExplorer}/>
        {displayFileExplorer && 
        <>
        <div className='flex justify-center'>
          <div id="nested_file_explorer_container"
          style={{ width: `${docViewerWidth * 0.8}px`, maxHeight: `calc(100vh * 0.7)` }} 
          className={`relative  p-2 h-fit mt-12 rounded-lg bg-[#333333] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-transparent`}
          >
        <NestedFileExplorer fileExplorer={fileExplorerContent} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay} setDisplayFileExplorer={setDisplayFileExplorer}/>
        </div>
        </div>
        </>}
        {fileToDisplay !== '' && <PdfDisplay fileToDisplay={fileToDisplay} docViewerWidth={docViewerWidth} numPages={numPages} setNumPages={setNumPages} zoomLevel={zoomLevel} setCurrentPage={setCurrentPage} />}
        {!fileExplorerContent && <FolderCreationContainer docViewerWidth={docViewerWidth} setFileExplorerContent={setFileExplorerContent} setUserFolderResult={setUserFolderResult}/>}
    </div>
  )
}

export default DocDisplayZone
