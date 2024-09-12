'use client'
import React, {useEffect, useState} from 'react'
import { HiMinusCircle } from "react-icons/hi2";
import { HiMiniPlusCircle } from "react-icons/hi2";

function HeaderDocDisplay({fileToDisplay, docViewerWidth, numPages, setZoomLevel, currentPage }) {


    const [fileName, setFileName] = useState<string>('Aucun fichier')

    useEffect(() => {
        const REGEX_FOR_FILENAME = /[^\/]+\.(pdf|txt|png|jpg|jpeg|docx|doc)/g

        if (fileToDisplay) {
            const filenameFromRegex = fileToDisplay.match(REGEX_FOR_FILENAME)
            console.log('filenameFromRegex[0]\n', filenameFromRegex[0]);
            
            setFileName(filenameFromRegex[0])    
        }
    
    }, [fileToDisplay])
 
  return (
    <>
    <div className='h-[30px] bg-[#333333] z-15 border-b border-[#515151] flex justify-between items-center px-2' style={{ width: `${docViewerWidth}px`, overflow: `overlay`}}>

    {numPages && <div id="num_page_viewed"> Page {currentPage} / {numPages}</div>}
    {!numPages && <div id="num_page_viewed"></div>}
    <div id="page_name">{fileName}</div>
    <div id="zoom">
    <div id="zoom" className='flex flex-row pr-2 items-center'>
      <span className='pr-1'>Zoom</span>
      <span className="hover:scale-125 text-xl" onClick={() => setZoomLevel(prevZoom => Math.max(prevZoom - 0.2, 0.5))}><HiMinusCircle/></span>
      <span className="hover:scale-125 text-xl" onClick={() => setZoomLevel(prevZoom => Math.min(prevZoom + 0.2, 2.0))}><HiMiniPlusCircle/></span>
    </div>
    </div>
    </div>
    </>
  )
}

export default HeaderDocDisplay