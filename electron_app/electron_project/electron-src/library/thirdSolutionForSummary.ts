
import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';
import { loadDevData } from './dataDev';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export async function getAllTextFromAllDocsInArray(dirPath:string) : Promise<string[]> {

    const dirItems: Dirent[] = await readdir(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    })

    let textsAlreadyExtract : string[] = []

        
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
               const textFromDocsFromSubfolder = await getAllTextFromAllDocsInArray(`${item.path}/${item.name}`);
               textsAlreadyExtract = [...textsAlreadyExtract, ...textFromDocsFromSubfolder]       
            }
        } else {
            const loadedData : { texts : string[], pageNumbers : number[]} = loadDevData(`${item.name}.json`);
            const textArray : string[] = loadedData.texts.map((text : any, index : number) => {
                // console.log('index\n', index);
                const modifiedItem = `\n${item.path}/${item.name} page ${index}\n` + text
                return modifiedItem
            })

            textsAlreadyExtract = [...textsAlreadyExtract, ...textArray]       
        }
                
    }

    return  textsAlreadyExtract
}


function splitArrayIntoParts(array: string[], parts: number): string[][] {

    let result: string[][] = [];
    let partSize = Math.ceil(array.length / parts);

    for (let i = 0; i < parts; i++) {
        let start = i * partSize;
        let end = start + partSize;
        result.push(array.slice(start, end));
    }

    return result;
}

export async function getSummaryByRecursivity(texts : string[], summaryExpectations : string) : Promise<string> {


    const length = texts.length
    const pageByChunk = 15
    const parts = length / pageByChunk

    const textSplitted = splitArrayIntoParts(texts, parts)


    let summary : string = ''

    for (const [index, textArray] of textSplitted.entries()) {

        const arrayJoinIntoString = textArray.join("\n");

        const chain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                `Voici le contenu de l'ensemble d'un dossier juridique dans lequel je travaille encerclées par des (&&&) :
                &&&
                {texts}\n\n
                &&&
    
                Cherche dans le contenu entre (&&&) les informations entre (***)
                ***
                {summaryExpectations}\n
                ***
    
                Dresse la liste d'information la plus complete et exhaustive possible pour répondre aux attentes de l'utilisateur, il faut
                être factuel et précis et n'ignorer aucune information. Donne le plus d'informations possibles. Tu peux expliquer pourquoi les éléments te semblent être des informations pertinentes
                en relation avec l'énoncé.
                
                Il faut toujours justifier l'origine de tes informations pour qu'on puisse vérifier. Au dessus de chaque partie de texte est indiqué l'origine du texte :
                x/x/x/x/.pdf page [X]. Tu peux ainsi écrire comme cela : 
                Information X ([chemin du fichier] page [X]).            
                `),
                new ChatOpenAI({
                    maxRetries: 3,
                    temperature: 0,
                    modelName: "gpt-4-1106-preview",
                    // verbose: true
               }),
            new StringOutputParser(),
        ]);
        
        const info = await chain.invoke({ texts : arrayJoinIntoString, summaryExpectations: summaryExpectations});

        const chain2 = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                `
                J'ai déja les informations suivantes dans un résumé entre (""") (ça peut-être vide si c'est la première fois) :
                """
                {summary}\n
                """\n\n

                Il faut que tu intègres les informations délimitées par (***) ci-dessous dans le résumé ci-dessus entre (""") en le réecrivant de manière cohérente et en gardant les sources : 
                ***
                {texts}
                ***
    
                Fais la synthèse la plus experte possible et la plus exhaustive possible pour répondre de la maniere la plus cohérente et complete
                possible aux attentes de l'utilisateur, il faut être factuel et précis et n'ignorer aucune information.
                
                Il faut toujours justifier l'origine de tes informations pour qu'on puisse vérifier. Au dessus de chaque partie de texte est indiqué l'origine du texte :
                x/x/x/x/.pdf page [X]. Tu peux ainsi écrire comme cela : 
                Information X ([chemin du fichier] page [X]).            
                `),
                new ChatOpenAI({
                    maxRetries: 3,
                    temperature: 0,
                    modelName: "gpt-4-1106-preview",
                    // verbose: true
               }),
            new StringOutputParser(),
        ]);
        
        summary = await chain2.invoke({ texts : info, summaryExpectations: summaryExpectations, summary : summary});
        console.log('summary ', index, ' \n', summary);
    

    
    }


    console.log(' \n***final summary***\n', summary);

    return summary
}