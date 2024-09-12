import React from 'react'
import NestedFileExplorer from './NestedFileExplorer';
import HeaderIconExtendedZone from './HeaderIconExtendedZone';

function IconExtendedZone({navFolderWidth, data, setFileToDisplay, setPageToDisplay, handleMouseDown}) {
  return (
    <div
    style={{ width: `${navFolderWidth}px`, overflow: `overlay` }}
    className='h-full overflow-x-hidden whitespace-nowrap p-0 text-clip relative bg-[#202124] overflow-y-scroll scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-transparent'
    >
    <HeaderIconExtendedZone/>
    <NestedFileExplorer data={data} setFileToDisplay={setFileToDisplay} setPageToDisplay={setPageToDisplay}/>
    {/* <div
    style={{ right: '0'}}
    className='absolute bottom-0 cursor-nwse-resize h-full w-[2px] bg-[#858585]'
    onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(e);
    }}
    ></div> */}
</div>
  )
}

export default IconExtendedZone