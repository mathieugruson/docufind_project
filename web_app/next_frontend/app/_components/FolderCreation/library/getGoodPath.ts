import React from 'react'
import {isNumeric} from 'validator';

function getGoodPath(path : string, folderName : string) {

  
  if (1) {
    console.log('getGoodPath');
    console.log('path : ', path);
    console.log('folderName : ', folderName);    
  }

  /* path is numeric when the user has only selected files
    but not a folder so we just return the folderName choosen by the user
  */
  if(isNumeric(path)) {

    return folderName

  } else {

    // REGEX RULE TO ISOLATE THE PATH WITHOUT THE FILENAME
    const REGEX_FOR_PATH = /^.*\//g    
    const pathFromRegex = path.match(REGEX_FOR_PATH) || ''
    const pathBis = pathFromRegex[0] || ''
   
      console.log('pathBs\n', pathBis);
  
      /* SPLIT THE PATH TO HAVE THE FIRST PART OF THE PATH TO CHANGE WITH FOLDERNAME
       IF THE USER CHOOSE A DIFFERENT NAME FOR THE FOLDER
      */

      let pathParts = pathBis.split('/');
  
      // Check if there are any parts to replace and if folderName is defined
      if (pathParts.length > 1 && folderName) {
        // Replace the first part of the path with folderName
        pathParts[0] = folderName;
      }
      
      // Rejoin the path parts into a new path
      let newPath = pathParts.join('/');
    
      return newPath

  }
  

}

export default getGoodPath