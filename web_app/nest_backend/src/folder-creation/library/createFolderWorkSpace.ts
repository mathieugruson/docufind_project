

import { promises as fs } from 'fs';
import 'dotenv/config'
import fillVectorDatabaseWithTextFromDocDir, { fillVectorDatabaseWithRetrievalLogic } from './fillVectorDatabase';

//Own Library
import { getVectorDatabaseTable } from './getVectorDatabaseTable';
import { getSummaryFromDoc, getFinalSummaryFromDocsWithLLM } from "../../query/library/getSummaryFromDoc";
import { getSummaryInstructionRefined } from "../../query/library/getSummaryInstructionRefined";
import { getAllTextFromAllDocsInOneString, getSummaryAllAtOnce } from "../../query/library/secondSolutionForSummary";
import { getAllTextFromAllDocsInArray, getSummaryByRecursivity } from "../../query/library/thirdSolutionForSummary";
import createJsonFileFromExtractingTextFromDocDirWithOCR from './createJsonFileFromExtractingTextFromDocDirWithOCR';
import { readDirectoryStructure } from './readDirectoryStructure';
// const openAIApiKey = process.env.OPENAI_API_KEY
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';


type CreateFolderWorkSpaceType = {
    folderPath : string,
    language : string,
}


// async function getWholeInfoFromEachDocFromEachFolderUsingLLM(dirPath: string, summaryExpectationsTest: string, caseContextTest : string): Promise<any> {

//     const dirItems: Dirent[] = await readdir(dirPath, {
//         encoding: 'utf-8',
//         withFileTypes: true,
//     })

//     let listInfoAlreadyGatheredFromThisFolderAndSubfolder : string = ''

        
//     for (const item of dirItems) {
//         if (item.isDirectory()) {
//             if (item.name != '.dev') {
//                const infoFromDocsFromSubfolder = await getWholeInfoFromEachDocFromEachFolderUsingLLM(`${item.path}/${item.name}`, summaryExpectationsTest, caseContextTest);
//                listInfoAlreadyGatheredFromThisFolderAndSubfolder = listInfoAlreadyGatheredFromThisFolderAndSubfolder + infoFromDocsFromSubfolder
//             }
//         } else {
//             console.log('c2\n');
//             const loadedData : { texts : string[], pageNumbers : number[]} = loadJsonData(`${item.name}.json`);
//             const infoFromDocsFromThisFolder = await getSummaryFromDoc(loadedData.texts, summaryExpectationsTest, listInfoAlreadyGatheredFromThisFolderAndSubfolder, caseContextTest)
//             listInfoAlreadyGatheredFromThisFolderAndSubfolder = listInfoAlreadyGatheredFromThisFolderAndSubfolder + infoFromDocsFromThisFolder       
//         }
                
//     }

//     return  listInfoAlreadyGatheredFromThisFolderAndSubfolder

// }


/**
 * @param workspaceInfo.folderPath = `./upload/${folderName}/${folder}`,
 */

export const createFolderWorkSpace = async (workspaceInfo: CreateFolderWorkSpaceType, socket : any): Promise<any> => {

    const caseContextTest = `Au cours d'une bagarre générale dans le Tramway, la victime Mahamadou DIAMNE, recevait un coup de couteau dans la\njambe, lui occasionnant 5 joursd'ITT. Il désignait deux individus  avant d'en innocenter un au cours d'une\nconfrontation : Bilal Rachid et il désignait formellement le second :  Hamid Yassine.`
    const summaryExpectationsTest = `rechercher dans le texte les différents éléments pouvant démontrer 1. la culpabilité ou 
    2. l'innocence des accusés : temoignage, video, arme du crime, telephone, presence sur les lieux,
    vidéosurveillance, contradiction, etc. Il faut ignorer tous les faits de procédure : deferement devant le parquet, mise en garde a vue, traductrice, lecture des droits, etc.`
    

    
    if (0) {
        const summaryInstruction = await getSummaryInstructionRefined(summaryExpectationsTest)
        console.log(summaryInstruction);
    }

    // 1. Obtenir la structure des fichiers
    // @ts-ignore
    const { tree: dirItems, fileCount }  = await readDirectoryStructure(workspaceInfo.folderPath)

    console.log('fileCount\n', fileCount);
    

    // 2. Creer la vector database ! 

    console.log('%c' + 'workspaceInfo.folderPath\n' + '%c' + workspaceInfo.folderPath, 'color: red;', 'color: red;');


    let table : any 
    if (1) {
        table =  await getVectorDatabaseTable(workspaceInfo.folderPath)
    }


    // 3. Obtenir le texte des documents
    if (1) {
        console.time("ocr");
        const startTime = Date.now(); // Capture start time

        const totalFilesPages = await createJsonFileFromExtractingTextFromDocDirWithOCR(workspaceInfo.folderPath, socket)
        const endTime = Date.now(); // Capture end time
        const executionTime = endTime - startTime; // Calculate the execution time in milliseconds


        console.timeEnd("ocr"); // https://medium.com/@kirankandel007/measuring-execution-time-in-nodejs-1d4179eeb860
        const loadingStatus = {
            status : 'succeed',
            totalFilesPages : totalFilesPages,
            totalFiles : fileCount,
            executionTime : executionTime
        }
        
        // TODO : RAJOUTER LE NOMBRE DE PAGE ENVOYE ET LE TEMPS QUE CA A PRIS, CA SERAIT INTERESSANT
        socket.emitProgress(loadingStatus)
    }
    
    if (1) {
        await fillVectorDatabaseWithTextFromDocDir(workspaceInfo.folderPath, table)
    }

    /*
    // first solution
    if (0) {

        const listInfoDocs = await getWholeInfoFromEachDocFromEachFolderUsingLLM(pathTest, summaryExpectationsTest, caseContextTest)
        
        const finalSummary = await getFinalSummaryFromDocsWithLLM(listInfoDocs, caseContextTest, summaryExpectationsTest)
        console.log('\n\n***result getFinalSummaryFromDocs***\n\n', finalSummary);
    }

    // seconde solution 
    if (0) {
        const textsStringFromAllDocs = await getAllTextFromAllDocsInOneString(pathTest)
        // @ts-ignore
        const summary = await getSummaryAllAtOnce(textsStringFromAllDocs, summaryExpectationsTest)
    }

    // troisième solution
    console.time("llm");

    const summaryExpectationsRaph = `rechercher dans le texte les différents éléments
    explicant les règles de droit des etats-unis et de l'europe concernant les normes à respecter pour un producteur de dispositif
    médical qui collecte des données à caractère personnel (DCP). Reponds sous la forme de bullet point dans chaque partie nécessaire`
    if (0) {        
        const textsArrayFromAllDocs = await getAllTextFromAllDocsInArray(pathTest)
        // @ts-ignore
        const summary = await getSummaryByRecursivity(textsArrayFromAllDocs, summaryExpectationsRaph)
        console.log('summary\n', summary);
    }
    console.timeEnd("llm"); // https://medium.com/@kirankandel007/measuring-execution-time-in-nodejs-1d4179eeb860
    */
    
        
    return dirItems

}



/**
 * TODO : zod pour controler l'input 
 * il faut pas que le folderPath soit vide : seule contrainte
 */