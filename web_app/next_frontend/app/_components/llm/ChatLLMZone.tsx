import React from 'react'
import LLMZone from './LLMZone';
import HeaderLLMZone from './HeaderLLMZone';

function ChatLLMZone({chatZoneWidth, setFileToDisplay, setPageToDisplay, fileToDisplay, handleMouseDownBis, userFolderResult} : any) {
  return (
    <div 
    style={{ width: `${chatZoneWidth}px` }}
    className='relative bg-[#202124] h-full w-3/6'
    >
        <div
            style={{ right: `${chatZoneWidth}px`}}
            className='absolute z-10 bg-[#858585] bottom-0 cursor-nwse-resize h-full w-[2px]'
            onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDownBis(e);
            }}
        ></div>
        <HeaderLLMZone/>
        <LLMZone
        chatZoneWidth={chatZoneWidth}
        setFileToDisplay={setFileToDisplay}
        setPageToDisplay={setPageToDisplay}
        fileToDisplay={fileToDisplay}
        userFolderResult={userFolderResult}
        />
    </div>
  )
}

export default ChatLLMZone