'use client'

import React, { useState, useRef, useEffect } from 'react'
import OpenAI from "openai";
import AnswerZone from './AnswerZone'
import { useQuery, useIsFetching } from "@tanstack/react-query"
import ky from 'ky';
import { FaPaperPlane } from 'react-icons/fa'
import { FaCircleArrowDown } from "react-icons/fa6";

function LLMZone(props : {
    chatZoneWidth : any,
    setFileToDisplay : any,
    setPageToDisplay: any, 
    fileToDisplay : any}) {
    
    const [userPrompt, setUserPrompt] = useState<string>('')
    const [messages, setMessages] = useState<any>([])
    const [isVisible, setIsVisible] = useState(false);

    const textareaRef = useRef(null);
    const containerRef = useRef(null);


    const { data, isFetching, isError, refetch } = useQuery<any>({
        queryKey: ['chatgpt'],
        queryFn: async () => {
            return new Promise((resolve, reject) => {

                const handleReceivingMessageAfterQuery = (event, args) => {
                    console.log('args for query\n', args);
                    
                    resolve(args);
                    // Cleanup: remove the listener after resolving
                    window.electron.stopReceiveSendQueryFromUser(handleReceivingMessageAfterQuery);
                };

                window.electron.receiveSendQueryFromUser(handleReceivingMessageAfterQuery);


                window.electron.sendQueryFromUser(userPrompt);

                // Optional: Setup a timeout or some mechanism to reject the promise if it takes too long
            });
        },
        refetchOnWindowFocus: false,
        enabled: false

    })

    /** TO MODIFY A STRING WITH REGEX

     * // Original text
const originalText = `Here is some text with a <span>foisonnement_penal.pdf pages 2, 55</span> reference.`;

// Function to modify the text inside <span> tags
function modifySpanContent(match: string, group1: string): string {
  // You can modify 'group1' or append/prepend text to it
  // Example: Append " (modified)" to the content inside <span>
  const modifiedContent = group1 + " (modified)";
  return `<span>${modifiedContent}</span>`;
}

// Use replace() with a regex to find matches and modify them
const modifiedText = originalText.replace(/<span>(.*?)<\/span>/g, modifySpanContent);

console.log(modifiedText);

     * 
     */

    const arrayToString = (pages : any) => {
    // Check if the array has more than one element to format it correctly
    if (pages.length > 1) {
      // Join all elements with a comma except for the last one
      let initialPart = pages.slice(0, -1).join(", ");
      // Get the last element
      let lastPart = pages[pages.length - 1];
      // Return the formatted string
      return ` pages ${initialPart} and ${lastPart}`;
    } else {
      // If the array has only one element or is empty, handle that case
      return ` page ${pages[0]}`; // Adjust based on how you want to handle empty arrays
    }
  }

    const modifyTextToMakeItClickable = async (htmlString : string) : Promise<string> => {
        
        const regexToIsolateSpan = /<span>(.*?)<\/span>/g;

        console.log('htmlString\n', htmlString);
        
        const spanMatches = htmlString.match(regexToIsolateSpan);



        console.log(`spanMatches\n`, spanMatches);
        let newHtmlString : string = htmlString
        
        const testObj = spanMatches.map((spanString : string) => {
            
            const REGEX_FOR_FILENAME = /[^\/]+\.(pdf|txt|png|jpg|jpeg|docx|doc)/g

            const REGEX_FOR_PATH = /(?<=<span>)(.*?)(?=\.(pdf|txt|png|jpg|jpeg|docx|doc))/g

            const REGEX_FOR_NUMBERS = /(?<=(.pdf|.txt).*?)(\d+)/g

            const numbersFromRegex = spanString.match(REGEX_FOR_NUMBERS)
            const pathFromRegex = spanString.match(REGEX_FOR_PATH)
            const filenameFromRegex = spanString.match(REGEX_FOR_FILENAME)

            console.log('pathFromRegex\n', pathFromRegex);
            

            const numbersToSpan = numbersFromRegex.map((number) => {
                return `<span onClick={() => {test(${pathFromRegex[0]}, ${number})}}>${number}</span>`
            })

            const pagesString = arrayToString(numbersToSpan)
  

            const newSpanString = `<span onClick={() => {test(${pathFromRegex[0]}, 0)}}>(${filenameFromRegex[0]} ${pagesString})</span>`

            /*
            <p>Monsieur DIANBIK Mahamadou a formellement identifié et reconnu deux des auteurs des violences lors de l'incident (<span onClick={() => {test('foisonnement_penal', 0)}}>(<span>foisonnement_penal.pdf pages <span onClick={() => {test('foisonnement_penal', 2)}}>2</span> and <span onClick={() => {test('foisonnement_penal', 55)}}>55</span>)</span>)</p>
<p>Monsieur LOL plait a Madame MDR lors de l'incident (<span onClick={() => {test('foisonnement_penal', 0)}}>(<span>foisonnement_penal.pdf pages <span onClick={() => {test('foisonnement_penal', 3)}}>3</span> and <span onClick={() => {test('foisonnement_penal', 45)}}>45</span>)</span>)</p>

            */

            console.log('newSpanString\n', newSpanString);
            
            newHtmlString = newHtmlString.replace(spanString, newSpanString);

            // 0. il faudra checker que c'est bien la bonne expression 

            
            // 1. il faut remplacer ce qui est necessaire dans la string d'origine, a savoir htmlString
                // 1.1 creer la phrase pour remplacer l'autre 
            
        })

        return newHtmlString
    }

    const modifyTextToMakeItClickable2 = (answer : string ) : any[] => {

        const REGEX_FOR_SPAN = /<span>(.*?)<\/span>/gs;
        const REGEX_FOR_SPAN_AND_TEXT = /<span>[\s\S]*?<\/span>|[^<]+/g;

        const REGEX_FOR_FILENAME = /[^\/>]+\.(pdf|txt|png|jpg|jpeg|doc|docx)/g
        const REGEX_FOR_PATH = /(?<=<span>)(.*?\.(pdf|txt|png|jpg|jpeg|doc|docx))/g
        const REGEX_FOR_NUMBERS = /(?<=(.pdf|.txt).*?)(\d+)/g
        const REGEX_FOR_NUMBERS2 = /(\d+)/g

        const segments = answer.match(REGEX_FOR_SPAN_AND_TEXT);
        console.log('segments\n', segments);


        let answerParse : any = []
        segments.map((segment : string) => {

            console.log('segment\n', segment);
            console.log('segment match\n', );
            
            if (segment.match(REGEX_FOR_SPAN)) {


                const numbersFromRegex = segment.match(REGEX_FOR_NUMBERS)
                console.log('numberR\n',numbersFromRegex);
                
                const pagesString = arrayToString(numbersFromRegex)
                const pathFromRegex = segment.match(REGEX_FOR_PATH)
                const filenameFromRegex = segment.match(REGEX_FOR_FILENAME)

                console.log('filenameFromRegex[0]\n', filenameFromRegex[0]);
                console.log('pathFromRegex[0]\n', pathFromRegex[0]);

                const answerObj = {
                    content : filenameFromRegex[0],
                    clickable : true,
                    filePath : pathFromRegex[0],
                    filePage : 0,
                }                
                
                answerParse.push(answerObj)
                
                const pageSplit = pagesString.split(REGEX_FOR_NUMBERS2) 

                console.log('pageSplit\n', pageSplit);
                
                pageSplit.map((item : string) => {

                    if (item.match(REGEX_FOR_NUMBERS2)) {

                        console.log('pathFromRegex[0] BIS\n', pathFromRegex[0]);
                        
                        const answerObj = {
                            content : item,
                            clickable : true,
                            filePath : pathFromRegex[0],
                            filePage : +item,
                        }
                        answerParse.push(answerObj)  

                    } else {
                        const answerObj = {
                            content : item,
                            clickable : false,
                            filePath : '',
                            filePage : 0,
                        }
                        answerParse.push(answerObj)  
                    }

                })

            } else {

                const answerObj = {
                    content : segment,
                    clickable : false,
                    filePath : '',
                    filePage : 0,
                }
                answerParse.push(answerObj) 
            }

        })

        console.log('answerParse\n', answerParse);
        
        return answerParse
    }

    const terminatePrompt = async () => {
        console.log('terminatePrompt start of the function');
        
        const newMessages = [...messages, { role: "user", content: `${userPrompt}`}]
        setMessages([...messages, { role: "user", content: `${userPrompt}` }])
        const data = await refetch();
        console.log('data');
        console.log(data);
        // here should be the mofication logic of the text
        const answerForUser = await modifyTextToMakeItClickable(data.data)
        const answerForUser2 = modifyTextToMakeItClickable2(data.data)
        
        // const msg =  `Monsieur DIANBIK Mahamadou a formellement identifié et reconnu deux des auteurs des violences lors de l'incident (<span onClick={() => {test('foisonnement_penal', 0)}}><span>foisonnement_penal.pdf</span></span>) Monsieur LOL plait a Madame MDR lors de l'incident (<span onClick={() => {test('foisonnement_penal', 0)}}><span>foisonnement_penal.pdf</span></span>)`
        const msg = `Monsieur DIANBIK Mahamadou a formellement identifié et
        reconnu deux des auteurs des violences lors de l'incident
        (<span onClick={terminatePrompt}>foisonnement_penal.pdf</span>)
        Monsieur LOL plait a Madame MDR lors de l'incident (<span onClick={() 
        => test('foisonnement_penal', 0)}>foisonnement_penal.pdf</span>)
        `
          
        console.log('async test', answerForUser);
        
        setMessages([...newMessages, { role: "prompt", content: answerForUser2 }])

        console.log('terminatePrompt end of the function');

    }

    useEffect(() => {
        const textarea = textareaRef.current;
        
        if (textarea) {
          textarea.style.height = 'auto'; // Reset height to recalculate
          textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
          textarea.style.width = 'auto'
          console.log(`${props.chatZoneWidth}px`);

          textarea.style.width = `${(props.chatZoneWidth - 120)}px`; // Set to scroll height

        }
      }, [userPrompt]); // Run effect on text change
    
      const handleChange = (e) => {
        setUserPrompt(e.target.value);
      };

        // h-[calc(100vh-150px)]

        const scrollToBottom = () => {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        };


    return (
        <>
        <div ref={containerRef} className='relative border-r border-neutral-300 h-[calc(100%-30px)] overflow-auto overflow-y-scroll scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-transparent' 
                        style={{
                            width: `${props.chatZoneWidth}px`, // Adjust width as needed
                        }}
        >
            <AnswerZone
                messages={messages}
                isFetching={isFetching}
                setFileToDisplay={props.setFileToDisplay}
                setPageToDisplay={props.setPageToDisplay}
                fileToDisplay={props.fileToDisplay}
                />

            <div className='bg-transparent fixed bottom-10 right-[40px] flex flex-col justify-center items-center'>
                <div id="button_to_scroll" onClick={scrollToBottom}
                    className="text-3xl pb-4 hover:scale-110">
                <FaCircleArrowDown/>
                </div> 
            <div
                className='bg-[#202124] border border-white flex justify-center items-center rounded-lg'
                // style={{right : `${((props.chatZoneWidth - (props.chatZoneWidth * 3/4)) / 2)}`}}
                >
                <textarea
                placeholder="Tapez votre question ici..."
                className="text-white bg-transparent overflow-hidden resize-none px-3 py-1 whitespace-normal focus:outline-none overflow-auto overflow-y-scroll scrollbar-thin scrollbar-rounded-lg scrollbar-thumb-[#858585] scrollbar-track-transparent"
                value={userPrompt}
                onChange={handleChange}
                ref={textareaRef}
                style={{
                    maxHeight: '150px', // Maximum height before scrolling
                    minHeight: '25px', // Minimum height
                    width: `${(props.chatZoneWidth - 120)}px`, // Adjust width as needed
                    // borderRadius: '8px',
                    // border: '1px solid #ccc', // Adjust border as needed
                    padding: '8px', // Adjust padding as needed
                    overflowY: 'auto', // Ensure we can scroll when content exceeds max height
                }}
                />
                    <div
                        className='m-3'
                        onClick={terminatePrompt}
                        >
                        <FaPaperPlane />
                    </div>
            </div>  
            </div>
        </div>
        </>
    )
}

export default LLMZone

