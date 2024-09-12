'use client'
import React from 'react'

function FolderName({setFolderName, folderName}) {

    return (
        <div className="relative flex-col p-2 bg-transparent w-4/5">
            <div className='relative flex flex-row p2 '>
            <label htmlFor="changeName">Nom du dossier </label>
            <input
                type="text"
                id="changeName"
                placeholder="Nom du dossier"
                value={folderName}
                required
                onChange={(e) => setFolderName(e.target.value)}
                className="p-1 rounded-xl text-black"
            />
            </div>
            {folderName === "" && (
                <p className="text-rose-700">A channel name is mandatory</p>
            )}
            {folderName.length > 50 && (
                <p className="text-rose-700">Max 50 characters</p>
            )}
        </div>
    );
}

export default FolderName