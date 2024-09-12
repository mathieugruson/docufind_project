'use client'
import React from 'react'

function EncryptionFilesToggle({setEncryptionToogle, encryptionToggle}) {

  return (
    <div className='flex flex-col items-start pb-2 rounded-xl w-5/6 pl-2'>
    <p className='p-1'>Souhaitez-vous encrypter votre dossier ?</p>
    <label htmlFor="check" className='relative' >
      <input
      type="checkbox"
      name="check"
      id="check"
      className='sr-only peer'
      checked={encryptionToggle}
      onChange={(e) => {
      setEncryptionToogle(e.target.checked)
      }}
        />
        <div className='relative w-20 h-10 bg-red-200 rounded-full cursor-pointer peer-checked:bg-green-300'></div>
        <span className='absolute w-2/5 transition-all duration-300 bg-red-500 rounded-full cursor-pointer h-4/5 top-1 left-1 peer-checked:bg-green-500 peer-checked:left-11'></span>
        </label>
      </div>
    )
}

export default EncryptionFilesToggle