import React from 'react'
import { IoMdSettings } from "react-icons/io";
import { FaFolderPlus } from "react-icons/fa";
import { FaFolderTree } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa";

function IconListZone({navIconWidth, setDisplayFolderCreation}) {
  return (
    <>
    <div id="iconBar"
    style={{ width: `${navIconWidth}px` }}
    className={`bg-[#333333] h-full border-r border-[#515151] flex flex-col items-center text-3xl text-[#858585]`}>
    <FaFolderPlus className='my-2 hover:text-[#515151] hover:scale-110' onClick={() => {
      setDisplayFolderCreation(true)
    }}/>
    <FaFolderOpen className='my-2 hover:text-[#515151] hover:scale-110'/>
    <FaFolderTree className='my-2 hover:text-[#515151] hover:scale-110'/>
    <IoMdSettings className='my-2 hover:text-[#515151] hover:scale-110'/>
    </div>
    </>
  )
}

export default IconListZone