import React, { useEffect, useState } from 'react'
import parse from 'html-react-parser';

//icon
import { MdDownload } from "react-icons/md";
import { RiFileDownloadLine } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";
import { BsClipboard2Fill } from "react-icons/bs";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { TiDelete } from "react-icons/ti";
import { RiFileDownloadFill } from "react-icons/ri";

// {gptChatCompletion && gptChatCompletion.choices[0].message.content.replace(/\n/g, "<br>")}
function AnswerZone({ messages, isFetching, setFileToDisplay, setPageToDisplay, fileToDisplay }: any) {

    // useEffect(() => {
    //     let answerText = messages?.choices[0].message.content.replace(/\n/g, "<br>")
    //     let x = document.querySelector('#answer')
    //     if (x) {
    //         x.innerHTML = answerText
    //     }

    // }, [gptChatCompletion])

    // h-[calc(100vh-150px)]

    return (
        <div className='flex justify-center'>
        {messages.length == 0 && <div className='flex flex-col justify-center items-center bg-[#202124]'>
            <div>Voici les informations clés de votre dossier : </div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <br/>
            <div>Voici des exemples de demandes que vous pourriez soumettre à notre logiciel : </div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>X fichiers, X pages, X mots, B langue</div>
            <br/>
            <div className=''>Vous êtes en panne d'inspiration ? Cliquez sur l'une de ces propositions pour lancer l'analyse</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>Fais une synthèse de ce dossier</div>
            <div className='border border-neutral-300 rounded-xl p-1 m-2'>Fais une frise chronologique de tous les éléments importants de ce dossier</div>
            
        </div>}
        {messages.length > 0 && <div
        className=' w-[85%] flex items-center bg-[#202124]'>
            <div id="answer" >
                { messages
                .map((msg: any, index: any) => (
                    <div key={index} className={`${msg.role === 'assistant' ? 'text-slate-500' : 'text-white'}`}
                    >
                    {msg.role == 'user' && 
                    <div className=' w-full flex flex-row py-2 mt-4 border-t border-[#515151] place-content-between'>
                        <div className='text-[%e8eaed] pr-2'>{msg.content}</div>
                        <div className='flex flex-row text-2xl'>
                        <RiFileDownloadFill className='pr-2 scale-125'/>
                        <BsClipboard2Fill className='pr-1'/>
                        <TiDelete className='pr-1'/>
                        <MdKeyboardArrowUp className='pr-1'/>
                        </div>
                    </div>}
                    {msg.role == 'prompt' && <div> {msg.content.map((item : any) => (
                        <span>
                        {item.clickable == true && 
                        <span className='underline hover:cursor-pointer hover:font-bold text-[#bdc1c6]' onClick={() => {
                            setPageToDisplay(item.filePage)
                            console.log('fileToDisplay\n', fileToDisplay);
                            console.log('item.filePath\n', item.filePath);
                            console.log('(fileToDisplay != item.filePath)\n', (fileToDisplay != item.filePath));
                            if (fileToDisplay !== item.filePath) {
                                console.log('gogo');
                                setFileToDisplay(item.filePath)
                            }
                        }}>
                        {item.content}</span>}
                        {item.clickable == false && <span className='text-[#bdc1c6]'>{item.content}</span>}
                        </span>
                    ))}</div>}
                    </div>
                    ))}
                <div className='h-[200px]'></div>
                {isFetching && <div>isFetching</div>}
            </div>
        </div>}
        </div>
    )

}

export default AnswerZone

/*

1. il faut faire un loader pour eviter que l'utilisateur attende dans le vide
2.  il faut trouver un moyen (regex ? .replace(/\n/g, "<br>")) pour bien afficher la réponse

*/