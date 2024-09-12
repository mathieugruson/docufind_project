import React, { useState, useEffect } from 'react'
import { set } from 'zod';
import { GoFileDirectory } from "react-icons/go";
import { IoIosArrowForward } from "react-icons/io";
import mammoth from "mammoth"
import { useSession } from 'next-auth/react';


const REGEX_FOR_FILE_EXTENSION = /\.([a-z]+)$/i;

function NestedFileExplorer(props: { fileExplorer: any, setFileToDisplay: any, setPageToDisplay : any, setDisplayFileExplorer : any }) {

    const [showNested, setShowNested] = useState({});
    const { data: session, status } = useSession();

    const toggleNested = (name) => {
        setShowNested({ ...showNested, [name]: !showNested[name] });
    };
    
    const fetchFileToDisplay = async (path : any) => {

        console.log('path?.fullPath', path?.fullPath)
        
            props.setFileToDisplay(path?.fullPath); // TODO : mettre le nom du fichier pour header
            props.setPageToDisplay(1)
            props.setDisplayFileExplorer(false)

        };



    const setFileToDisplay = async (path: any) => {
        console.log(JSON.stringify(path, null, 2))
        console.log('setFileToDisplay', path?.fullPath)
        // Connaitre l'extension
        
        
        // si pas docx, faire la routine
        
        if (path?.fullPath) {

            
            // const fileExtensionName = path.fullPath.match(REGEX_FOR_FILE_EXTENSION)
            // console.log('fileExtensionName\n', fileExtensionName[0]);
            
            // if (fileExtensionName[0] === ".docx") {
            //     await mammoth.convertToHtml({path: path.fullPath})
            //     .then(function(result){
            //         var html = result.value; // The generated HTML
            //         var messages = result.messages; // Any messages, such as warnings during conversion
            //                         console.log('DocsToHtml\n', html);

            //     })
            //     .catch(function(error) {
            //         console.error(error);
            //     });

            //     // const DocsToRaw = await mammoth.extractRawText({path: path.fullPath})
            //     // .then(function(result){
            //     //     var text = result.value; // The raw text
            //     //     var messages = result.messages;
            //     // })
            //     // .catch(function(error) {
            //     //     console.error(error);
            //     // });

            //     // console.log('DocsToRaw\n', DocsToRaw);

            // }


            console.log('c1bis');
            props.setFileToDisplay(path.fullPath)
            props.setPageToDisplay(1)

        }
    }


    return (
        // <div
        // className='h-full overflow-x-hidden whitespace-nowrap p-0 text-clip relative bg-[#202124] overflow-y-scroll scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-transparent'
        // >
        <div className='relative w-full pl-2 overflow-visible'>
            {props.fileExplorer?.map((parent) => {
                return (
                    <div key={parent.name} className='w-full whitespace-nowrap pl-1 border-l border-[#858585]'>
                        {/* rendering folders */}
                        {parent.isFolder && (
                            <div className="w-full flex flex-inline items-center whitespace-nowrap hover:bg-[#515151]" onClick={() => toggleNested(parent.name)}>
                            <GoFileDirectory className=''/>
                            <span className=" pl-1">
                            {parent.name}
                            </span>
                        </div>
                        )}
                        {!parent.isFolder && (
                            <button
                            className="w-full whitespace-nowrap flex flex-inline items-center hover:bg-[#515151]"
                            onClick={async (e) => {
                                console.log('c1');
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('parent...\n', parent);
                                await fetchFileToDisplay(parent);
                            }}
                            >
                            <IoIosArrowForward className=""/>
                            <span className="">
                            {parent.name}
                            </span>
                        </button>
                        )}
                        <div style={{ display: !showNested[parent.name] && "none" }}>
                            {parent.children && <NestedFileExplorer fileExplorer={parent.children} setFileToDisplay={props.setFileToDisplay} setPageToDisplay={props.setPageToDisplay} setUrlFileToDisplay={props.setUrlFileToDisplay} setDisplayFileExplorer={props.setDisplayFileExplorer}/>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default NestedFileExplorer

/*

https://blog.logrocket.com/recursive-components-react-real-world-example/

*/