'use client'

import React, { useState, useRef, useEffect } from 'react'
import OpenAI from "openai";
import AnswerZone from './AnswerZone'
import { useQuery, useIsFetching } from "@tanstack/react-query"
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import QuestionContainer from './QuestionContainer';
import ScrollToBottomButton from './ScrollToBottomButton';
import modifyTextToMakeItClickable from './library/modifyTextToMakeItClickable';
import { TFolderInfo } from '../FolderCreation/type/TFolderCreation';
const defaultSocketOptions : any = {
    'reconnection': true,
    // 'timeout' : 5000,
    // 'retries': 3,
    // 'ackTimeout': 3000,
    // 'pingTimeout': 2000,
}

// surement a cause du timeout !!!!
async function getConversation(bearerToken : string) {
    const conversationUuid = localStorage.getItem('currentConversationUuid');
    console.log('getConversation conversationUuid : ', conversationUuid);
    
    if (conversationUuid && conversationUuid !== '') {
        const endpoint = 'back_api/query/conversation'; // Replace with your actual endpoint
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${bearerToken}`
                },
                body: JSON.stringify({
                    'conversationUuid': conversationUuid
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonResponse = await response.json();
            console.log('getConversation response\n', jsonResponse);
            
            return jsonResponse;
        } catch (error) {
            console.error("Error fetching conversation:", error);
            throw error; // Rethrow to be caught by React Query error handling
        }
    }

    return {};
}

async function saveQuestion(body : any, bearerToken : any) {

    const endpoint = 'back_api/query/save-question'; // Replace with your actual endpoint
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // console.log('response\n', await response.json());
    
    return await response.json();
}


function LLMZone(props : {
    chatZoneWidth : any,
    setFileToDisplay : any,
    setPageToDisplay: any, 
    fileToDisplay : any,
    userFolderResult : TFolderInfo}) {

    const { data: session, status } = useSession();
    const [userPrompt, setUserPrompt] = useState<string>('')
    const [messages, setMessages] = useState<any>([])
    // const [conversationUuid, setConversationUuid] = useState<string>('')
    const [isVisible, setIsVisible] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const { data : conversationData, error, isLoading } = useQuery({
        queryKey: ['conversation', session?.backendTokens.accessToken],
        queryFn: async () => {
            const data = await getConversation(session?.backendTokens.accessToken)
            console.log('DATADATA ', data);
            
            return data
          },
      });
    
    const textareaRef = useRef(null);
    const containerRef = useRef(null);


    useEffect(() => {
      console.log('START SESSION');
      
        // Check if session exists and has the necessary token
      if (session && session.backendTokens.accessToken) {
        // Establish socket connection including the token for authentication
        console.log('${process.env.NEXT_PUBLIC_NGINX_PORT} : ', `${process.env.NEXT_PUBLIC_NGINX_PORT}`);
        
        const newSocket = io(`http://localhost:${process.env.NEXT_PUBLIC_NGINX_PORT}/query`, {
        //   ...defaultSocketOptions,
          query: { token: session.backendTokens.accessToken },
        });
        setSocket(newSocket);
  
        // Cleanup function
        return () => {
          console.log('CLOSE SESSION');
          newSocket.close();
        };
      }
    }, [session]); // Re-run effect if 'session` changes
  
    useEffect(() => {
        // This function transforms the conversation data into the expected message format
        const transformConversationToMessages = (conversationData : any) => {
            console.log('conversationData\n', conversationData);
            
            if (!conversationData) return [];
    
            // Assuming conversationData is an array of message objects
            // You might need to adjust this transformation based on your actual data structure
            try {
                
                const test = conversationData.flatMap(({ questionContent, answerContent } : any) => [
                    { role: "user", content: questionContent },
                    { role: "prompt", content: modifyTextToMakeItClickable(answerContent) },
                ]);
                return test
            } catch (error) {
                return []
                
            }

        };
    
        console.log('conversationData : ', conversationData);
        
        if (conversationData) {
            const transformedMessages = transformConversationToMessages(conversationData);
            setMessages(transformedMessages);
        }
    }, [conversationData]);

    useEffect(() => {
        if (socket) {
            socket.on('connect_error', (error) => {
                console.error('Connection Error:', error);
            });
    
            socket.on('connect_timeout', (timeout) => {
                console.error('Connection Timeout:', timeout);
            });

            console.log('Socket CONNECT');
            socket.on('query', (data) => {

                console.log('progress\n', data); // Or update a state to display the progress in the UI
                const answerForUser = modifyTextToMakeItClickable(data)
                console.log('answerForUser', answerForUser);
                setMessages((currentMessages : any) => [...currentMessages, { role: "prompt", content: answerForUser }]);

            });
        }
    
        return () => {
            if (socket) {
                console.log('Socket DISCONNECT');
                
                socket.off('connect_error');
                socket.off('connect_timeout');
                
                socket.off('query');
            }
        };
    }, [socket]);

    const sendQuery = async () => {
        // const newMessages = [...messages, { role: "user", content: `${userPrompt}`}]
        setMessages((currentMessages : any) => [...currentMessages, { role: "user", content: userPrompt }]);
        // setMessages([...newMessages, { role: "user", content: `${userPrompt}` }])\
        // const newMessages = [...messages, { role: "user", content: `${userPrompt}`}];
        // setMessages(newMessages);
        const currentConversationUuid = localStorage.getItem('currentConversationUuid');
        const currentFolderName = localStorage.getItem('currentFolder');
        const currentFolderUuid = localStorage.getItem('currentFolderUuid');

        const bodyFetch : any = {
            userPrompt : userPrompt,
            folderName : currentFolderName,
            folderUuid : currentFolderUuid,
            conversationUuid : currentConversationUuid
        }

        const result = await saveQuestion(bodyFetch, session?.backendTokens.accessToken)
        console.log('LLM Zone\n', result);
        
        localStorage.setItem('currentConversationUuid', result.conversationUuid);
        localStorage.setItem('currentQuestionUuid', result.questionUuid);

        const bodyEmit : any = {
            userPrompt : userPrompt,
            folderName : currentFolderName,
            folderUuid : currentFolderUuid,
            conversationUuid : currentConversationUuid,
            questionUuid : result.questionUuid
        }

        if (socket) {
            console.log('SOCKET SENT ');
            socket.emit('ask', bodyEmit, (err: any) => {  });
        }
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
            <AnswerZone messages={messages} setFileToDisplay={props.setFileToDisplay} setPageToDisplay={props.setPageToDisplay} fileToDisplay={props.fileToDisplay} />
            <div id="bottom_llm_zone"className='bg-transparent fixed bottom-10 right-[40px] flex flex-col justify-center items-center'>
                <ScrollToBottomButton scrollToBottom={scrollToBottom}/>
                <QuestionContainer userPrompt={userPrompt} handleChange={handleChange} textareaRef={textareaRef} chatZoneWidth={props.chatZoneWidth} sendQuery={sendQuery}/>
            </div>
        </div>
        </>
    )
}

export default LLMZone

/**
 * TODO : bloquer la possibilité d'envoyer un message si y'a pas de documents, 
 * voire faire apparaitre que dans ce cas, ce qui permet d'extraire le nom du
 * folder de la local db dans currentFolder key
 */
