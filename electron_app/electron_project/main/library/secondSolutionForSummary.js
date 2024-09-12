"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryAllAtOnce = exports.getAllTextFromAllDocsInOneString = void 0;
const promises_1 = require("node:fs/promises");
const dataDev_1 = require("./dataDev");
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
async function getAllTextFromAllDocsInOneString(dirPath) {
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    let textsAlreadyExtract = '';
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                const textFromDocsFromSubfolder = await getAllTextFromAllDocsInOneString(`${item.path}/${item.name}`);
                textsAlreadyExtract = textsAlreadyExtract + textFromDocsFromSubfolder;
            }
        }
        else {
            const loadedData = (0, dataDev_1.loadDevData)(`${item.name}.json`);
            let textFromThisFile = '';
            loadedData.texts.map((text, index) => {
                console.log('index\n', index);
                const modifiedTextWithFileNameInserted = `\n${item.path}/${item.name} page ${index}\n` + text;
                textFromThisFile = textFromThisFile + modifiedTextWithFileNameInserted;
            });
            textsAlreadyExtract = textsAlreadyExtract + textFromThisFile;
        }
    }
    return textsAlreadyExtract;
}
exports.getAllTextFromAllDocsInOneString = getAllTextFromAllDocsInOneString;
async function getSummaryAllAtOnce(texts, summaryExpectations) {
    const chain2 = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(`Voici le contenu de l'ensemble d'un dossier judiciaire dans lequel je travaille encerclées par des (&&&) :
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
        new openai_1.ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-4-1106-preview",
            // verbose: true
        }),
        new output_parsers_1.StringOutputParser(),
    ]);
    const summary = await chain2.invoke({ texts: texts, summaryExpectations: summaryExpectations });
    console.log(' \n***getSummaryAllAtOnce summary***\n', summary);
    return summary;
}
exports.getSummaryAllAtOnce = getSummaryAllAtOnce;
