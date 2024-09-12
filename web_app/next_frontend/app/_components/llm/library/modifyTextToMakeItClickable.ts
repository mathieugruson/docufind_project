import React from 'react'


/*

Cette fonction vise à séparer le texte en différentes partie pour pouvoir
vérifier dans le pdf en clickant dessus si nécessaire

Dans la LLM, les infos qui seront clickables sont mis entre span pou
pouvoir être traité ensuite

*/

const arrayToString = (pages : any) : string => {
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

const extractPathFromSegment = (segment : string) : any => {

    const REGEX_FOR_PATH = /(?<=<span>)(.*?\.(pdf|txt|png|jpg|jpeg|doc|docx))/g
    const pathFromRegexTmp = segment.match(REGEX_FOR_PATH)
    if (pathFromRegexTmp) {
        return pathFromRegexTmp[0]
    }

    return ''


}

const getFileNamePartClickable = (segment : string, pathFileFromRegex : any, answerParse : any) : void  => {
        

    // REGEX POUR AVOIR LE NOM DU FICHIER
    const REGEX_FOR_FILENAME = /[^\/>]+\.(pdf|txt|png|jpg|jpeg|doc|docx)/g

    const filenameFromRegex = segment.match(REGEX_FOR_FILENAME)

    // console.log('pathFromRegex?[0]:\n', pathFileFromRegex);

    if (filenameFromRegex) {

        // console.log('!!!!! filenameFromRegex?[0]:\n', filenameFromRegex[0]);
        
        const answerObj = {
            content : filenameFromRegex[0],
            clickable : true,
            filePath : pathFileFromRegex,
            filePage : 0,
        }
        
        answerParse.push(answerObj)
    }
        
}

const getPageNumberPartClickable = (segment : string, pathFileFromRegex : any, answerParse : any) : void => {

    // REGEX POUR AVOIR LE NUMERO DES PAGES DANS LE CONTEXTE DU SPAN
    const REGEX_FOR_NUMBERS = /(?<=(.pdf|.txt).*?)(\d+)/g
    const REGEX_FOR_NUMBERS2 = /(\d+)/g

    const numbersFromRegex = segment.match(REGEX_FOR_NUMBERS)
    console.log('numberR\n',numbersFromRegex);
    const pagesString = arrayToString(numbersFromRegex)
    const pageSplit = pagesString.split(REGEX_FOR_NUMBERS2) 
    console.log('pageSplit\n', pageSplit);
    pageSplit.map((item : string) => {

        if (item.match(REGEX_FOR_NUMBERS2)) {

            console.log('pathFromRegex[0] BIS\n', pathFileFromRegex);
            
            const answerObj = {
                content : item,
                clickable : true,
                filePath : pathFileFromRegex,
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


}



const modifyTextToMakeItClickable = (answer : string ) : any[] => {

    // REGEX POUR CHECKER SI C'EST UN SPAN
    const REGEX_FOR_SPAN = /<span>(.*?)<\/span>/gs;
    // REGEX POUR SEPARER TEXT ET SPAN
    const REGEX_FOR_SPAN_AND_TEXT = /<span>[\s\S]*?<\/span>|[^<]+/g;

    // Split the whole answer into part to extract span and make it clickable
    const segments = answer.match(REGEX_FOR_SPAN_AND_TEXT);
    console.log('segments\n', segments);


    let answerParse : any = []
    segments?.map((segment : string) => {

        console.log('segment\n', segment);
        console.log('segment match\n', );
        
        // REGEX POUR AVOIR LE PATH DANS LE CONTEXT DU SPAN

        const pathFileFromRegex = extractPathFromSegment(segment) 


        if (segment.match(REGEX_FOR_SPAN)) {

            /*
            TODO : mettre un exemple de span. C'est un text ou l'on peut cliquer
            1. sur le nom de fichier 2. sur les pages et 3. ou il y a des bouts non
            cliquables mais qui servent a l inteligibilite
            */

            console.log('SPAN\n', segment);
            

           getFileNamePartClickable(segment, pathFileFromRegex, answerParse)                      

           getPageNumberPartClickable(segment, pathFileFromRegex, answerParse)

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

export default modifyTextToMakeItClickable