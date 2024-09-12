
import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';
import { loadDevData } from './dataDev';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export async function getAllTextFromAllDocsInOneString(dirPath:string) : Promise<string> {

    const dirItems: Dirent[] = await readdir(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    })

    let textsAlreadyExtract : string = ''

        
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
               const textFromDocsFromSubfolder = await getAllTextFromAllDocsInOneString(`${item.path}/${item.name}`);
               textsAlreadyExtract = textsAlreadyExtract + textFromDocsFromSubfolder
            }
        } else {
            const loadedData : { texts : string[], pageNumbers : number[]} = loadDevData(`${item.name}.json`);
            let textFromThisFile = ''
            loadedData.texts.map((text : any, index : number) => {
                console.log('index\n', index);
                const modifiedTextWithFileNameInserted = `\n${item.path}/${item.name} page ${index}\n` + text
                textFromThisFile = textFromThisFile + modifiedTextWithFileNameInserted
            })
            textsAlreadyExtract = textsAlreadyExtract + textFromThisFile       
        }
                
    }

    return  textsAlreadyExtract
}

export async function getSummaryAllAtOnce(texts : string, summaryExpectations : string) : Promise<string> {

    const chain2 = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            `Voici le contenu de l'ensemble d'un dossier judiciaire dans lequel je travaille encerclées par des (&&&) :
            &&&
            {texts}\n\n
            &&&

            Cherche dans le contenu entre (&&&) les informations entre (***)
            ***
            {summaryExpectations}\n
            ***

            Fais la synthèse la plus experte possible et la plus exhaustive possible pour répondre de la maniere la plus exhaustive possible aux attentes de l'utilisateur, il faut
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
    
    const summary = await chain2.invoke({ texts : texts, summaryExpectations: summaryExpectations});

    console.log(' \n***getSummaryAllAtOnce summary***\n', summary);


    return summary
}