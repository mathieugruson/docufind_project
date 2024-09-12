import React from 'react'
import { IoMdSettings } from "react-icons/io";
import { FaFolderPlus } from "react-icons/fa";
import { FaFolderTree } from "react-icons/fa6";
import { FaFolderOpen } from "react-icons/fa";

// @ts-ignore
function IconListZone({menuWidth, setDisplayFolderCreation}) {
  return (
    <>
    <div id="iconBar"
    style={{ width: `${menuWidth}px` }}
    className={`bg-[#333333] h-full border-r border-[#515151] flex flex-col text-[#858585] pl-2`}>
        <div className='flex inline-flex justify-items-start items-center space-x-2'>
          <FaFolderPlus className='my-2 hover:text-[#515151] hover:scale-110' onClick={() => {
          setDisplayFolderCreation(true)
        }}/>
        <div>Créer un dossier</div>
        </div>
        <div className='flex inline-flex justify-items-start items-center space-x-2'>
        <FaFolderTree className='my-2 hover:text-[#515151] hover:scale-110'/>
        <div>Mes dossiers</div>
        </div>
        <div className='flex inline-flex justify-items-start items-center space-x-2'>
        <IoMdSettings className='my-2 hover:text-[#515151] hover:scale-110'/>
        <div>Paramètres</div>
        </div>
    </div>
    </>
  )
}

export default IconListZone