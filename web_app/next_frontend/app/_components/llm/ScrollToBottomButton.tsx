import React from 'react'
import { FaCircleArrowDown } from "react-icons/fa6";

function ScrollToBottomButton({scrollToBottom} : any) {
  return (
    <div id="button_to_scroll" onClick={scrollToBottom}
    className="text-3xl pb-4 hover:scale-110">
    <FaCircleArrowDown/>
    </div> 
  )
}

export default ScrollToBottomButton