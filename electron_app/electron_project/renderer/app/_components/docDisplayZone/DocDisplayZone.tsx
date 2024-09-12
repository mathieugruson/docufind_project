import React, {useEffect, useState} from 'react'
import HeaderDocDisplay from './HeaderDocDisplay'
import PdfDisplay from './PdfDisplay'

function DocDisplayZone({fileToDisplay, docViewerWidth, handleMouseDown}) {

  const [numPages, setNumPages] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1); // Current page state

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
        <HeaderDocDisplay fileToDisplay={fileToDisplay} docViewerWidth={docViewerWidth} numPages={numPages} setZoomLevel={setZoomLevel} currentPage={currentPage}/>
        <PdfDisplay fileToDisplay={fileToDisplay} docViewerWidth={docViewerWidth} numPages={numPages} setNumPages={setNumPages} zoomLevel={zoomLevel} setCurrentPage={setCurrentPage}/>
    </div>
  )
}

export default DocDisplayZone


{/* <div
id="lolo"
style={{ width: `${docViewerWidth}px`, overflow: `overlay` }}
className='relative h-[calc(100%-30px)] pt-2 border-1 border-black bg-[#202124] flex justify-center overflow-auto overflow-y-scroll scroll-p-0 scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-[#202124]'>    
    <PdfDisplay fileToDisplay={fileToDisplay}/>
</div> */}