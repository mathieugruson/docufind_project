"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryByRecursivity = exports.getAllTextFromAllDocsInArray = void 0;
const promises_1 = require("node:fs/promises");
const dataDev_1 = require("./dataDev");
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
async function getAllTextFromAllDocsInArray(dirPath) {
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    let textsAlreadyExtract = [];
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                const textFromDocsFromSubfolder = await getAllTextFromAllDocsInArray(`${item.path}/${item.name}`);
                textsAlreadyExtract = [...textsAlreadyExtract, ...textFromDocsFromSubfolder];
            }
        }
        else {
            const loadedData = (0, dataDev_1.loadDevData)(`${item.name}.json`);
            const textArray = loadedData.texts.map((text, index) => {
                // console.log('index\n', index);
                const modifiedItem = `\n${item.path}/${item.name} page ${index}\n` + text;
                return modifiedItem;
            });
            textsAlreadyExtract = [...textsAlreadyExtract, ...textArray];
        }
    }
    return textsAlreadyExtract;
}
exports.getAllTextFromAllDocsInArray = getAllTextFromAllDocsInArray;
function splitArrayIntoParts(array, parts) {
    let result = [];
    let partSize = Math.ceil(array.length / parts);
    for (let i = 0; i < parts; i++) {
        let start = i * partSize;
        let end = start + partSize;
        result.push(array.slice(start, end));
    }
    return result;
}
async function getSummaryByRecursivity(texts, summaryExpectations) {
    const length = texts.length;
    const pageByChunk = 15;
    const parts = length / pageByChunk;
    const textSplitted = splitArrayIntoParts(texts, parts);
    let summary = '';
    for (const [index, textArray] of textSplitted.entries()) {
        const arrayJoinIntoString = textArray.join("\n");
        const chain = runnables_1.RunnableSequence.from([
            prompts_1.PromptTemplate.fromTemplate(`Voici le contenu de l'ensemble d'un dossier juridique dans lequel je travaille encerclées par des (&&&) :
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
            new openai_1.ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-4-1106-preview",
                // verbose: true
            }),
            new output_parsers_1.StringOutputParser(),
        ]);
        const info = await chain.invoke({ texts: arrayJoinIntoString, summaryExpectations: summaryExpectations });
        const chain2 = runnables_1.RunnableSequence.from([
            prompts_1.PromptTemplate.fromTemplate(`
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
            new openai_1.ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-4-1106-preview",
                // verbose: true
            }),
            new output_parsers_1.StringOutputParser(),
        ]);
        summary = await chain2.invoke({ texts: info, summaryExpectations: summaryExpectations, summary: summary });
        console.log('summary ', index, ' \n', summary);
    }
    console.log(' \n***final summary***\n', summary);
    return summary;
}
exports.getSummaryByRecursivity = getSummaryByRecursivity;
