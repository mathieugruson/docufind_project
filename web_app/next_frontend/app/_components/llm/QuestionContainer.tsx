import React from 'react'
import { FaPaperPlane } from 'react-icons/fa'

function QuestionContainer({userPrompt, handleChange, textareaRef,chatZoneWidth, sendQuery} : any) {
  return (
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
            width: `${(chatZoneWidth - 120)}px`, // Adjust width as needed
            // borderRadius: '8px',
            // border: '1px solid #ccc', // Adjust border as needed
            padding: '8px', // Adjust padding as needed
            overflowY: 'auto', // Ensure we can scroll when content exceeds max height
        }}
        />
            <div
                className='m-3'
                onClick={sendQuery}
                >
                <FaPaperPlane />
            </div>
    </div>  
  )
}

export default QuestionContainer