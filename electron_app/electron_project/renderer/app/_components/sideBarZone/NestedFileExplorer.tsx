import React, { useState } from 'react'
import { set } from 'zod';
import { GoFileDirectory } from "react-icons/go";
import { GoFile } from "react-icons/go";
import { GoRelFilePath } from "react-icons/go";
import { IoIosArrowForward } from "react-icons/io";
import mammoth from "mammoth"


const REGEX_FOR_FILE_EXTENSION = /\.([a-z]+)$/i;

function NestedFileExplorer(props: { data: any, setFileToDisplay: any, setPageToDisplay }) {

    const [showNested, setShowNested] = useState({});

    const toggleNested = (name) => {
        setShowNested({ ...showNested, [name]: !showNested[name] });
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
        <div className='pl-2 '>
            {props.data?.map((parent) => {
                return (
                    <div key={parent.name} className='pl-1 border-l border-[#858585] overflow-x-hidden'>
                        {/* rendering folders */}
                        {parent.isFolder && (
                        <div className="flex items-center relative hover:bg-[#515151] overflow-hidden" onClick={() => toggleNested(parent.name)}>
                            <GoFileDirectory className='min-w-[1em] text-xl'/>
                            <span className="whitespace-nowrap overflow-hidden pl-1">
                            {parent.name}
                            </span>
                        </div>
                        )}
                        {!parent.isFolder && (
                        <button
                            className="flex items-center opacity-75 relative hover:bg-[#515151] hover:opacity-100 focus:bg-[#595959] outline-none whitespace-nowrap overflow-hidden"
                            onClick={async (e) => {
                            console.log('c1');
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('parent...\n', parent);
                            
                            await setFileToDisplay(parent);
                            }}
                        >
                            <IoIosArrowForward className="flex-shrink-0 min-w-[1em] text-xl"/>
                            <span className="pl-1">
                            {parent.name}
                            </span>
                        </button>
                        )}
                        <div style={{ display: !showNested[parent.name] && "none" }}>
                            {parent.children && <NestedFileExplorer data={parent.children} setFileToDisplay={props.setFileToDisplay} setPageToDisplay={props.setPageToDisplay}/>}
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