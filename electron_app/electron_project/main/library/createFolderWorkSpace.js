"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFolderWorkSpace = void 0;
const promises_1 = require("node:fs/promises");
const fs_1 = require("fs");
require("dotenv/config");
const fillVectorDatabaseWithRetrievalLogic_1 = require("./fillVectorDatabaseWithRetrievalLogic");
const electron_1 = require("electron");
const mammoth_1 = __importDefault(require("mammoth"));
const path_1 = __importDefault(require("path"));
//Own Library
const getDataFromOCR_1 = require("./getDataFromOCR");
const getVectorDatabaseTable_1 = require("./getVectorDatabaseTable");
const dataDev_1 = require("./dataDev");
const getSummaryFromDoc_1 = require("./getSummaryFromDoc");
const getSummaryInstructionRefined_1 = require("./getSummaryInstructionRefined");
const secondSolutionForSummary_1 = require("./secondSolutionForSummary");
const thirdSolutionForSummary_1 = require("./thirdSolutionForSummary");
// const openAIApiKey = process.env.OPENAI_API_KEY
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
async function getWholeInfoFromEachDocFromEachFolderUsingLLM(dirPath, summaryExpectationsTest, caseContextTest) {
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    let listInfoAlreadyGatheredFromThisFolderAndSubfolder = '';
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                const infoFromDocsFromSubfolder = await getWholeInfoFromEachDocFromEachFolderUsingLLM(`${item.path}/${item.name}`, summaryExpectationsTest, caseContextTest);
                listInfoAlreadyGatheredFromThisFolderAndSubfolder = listInfoAlreadyGatheredFromThisFolderAndSubfolder + infoFromDocsFromSubfolder;
            }
        }
        else {
            console.log('c2\n');
            const loadedData = (0, dataDev_1.loadDevData)(`${item.name}.json`);
            const infoFromDocsFromThisFolder = await (0, getSummaryFromDoc_1.getSummaryFromDoc)(loadedData.texts, summaryExpectationsTest, listInfoAlreadyGatheredFromThisFolderAndSubfolder, caseContextTest);
            listInfoAlreadyGatheredFromThisFolderAndSubfolder = listInfoAlreadyGatheredFromThisFolderAndSubfolder + infoFromDocsFromThisFolder;
        }
    }
    return listInfoAlreadyGatheredFromThisFolderAndSubfolder;
}
async function fillVectorDatabaseWithTextFromDocDir(dirPath, table) {
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                await fillVectorDatabaseWithTextFromDocDir(`${item.path}/${item.name}`, table);
            }
        }
        else {
            const DataFromTextJson = (0, dataDev_1.loadDevData)(`${item.name}.json`);
            await (0, fillVectorDatabaseWithRetrievalLogic_1.fillVectorDatabaseWithRetrievalLogic)(DataFromTextJson.texts, DataFromTextJson.pageNumbers, `${item.path}/${item.name}`, table); // https://js.langchain.com/docs/modules/data_connection/  
        }
    }
}
function getFileName(filePath) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return the whole name; otherwise, return the part before the dot
    if (!dotIndex)
        return baseName;
    return dotIndex === -1 ? baseName : baseName?.substring(0, dotIndex);
}
function getFileExtension(filePath) {
    // Get the last portion of the path (in case it's a path)
    const baseName = filePath.split('/').pop();
    // Find the last dot where the extension starts
    const dotIndex = baseName?.lastIndexOf('.');
    // If there is no dot, return an empty string; otherwise, return the part after the dot
    if (!dotIndex)
        return baseName;
    return dotIndex === -1 ? '' : baseName?.substring(dotIndex + 1);
}
async function createPdfFromHtml(htmlContent, outputPath) {
    const win = new electron_1.BrowserWindow({ show: false }); // Create an off-screen BrowserWindow
    // await win.loadURL(`data:text/html,${encodeURIComponent(htmlContent)}`); // Load the HTML content
    await win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`); // Ensure UTF-8 encoding for HTML content
    const pdfData = await win.webContents.printToPDF({});
    await fs_1.promises.writeFile(outputPath, pdfData);
    console.log(`PDF Generated: ${outputPath}`);
}
async function createJsonFileFromExtractingTextFromDocDirWithOCR(dirPath) {
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                await createJsonFileFromExtractingTextFromDocDirWithOCR(`${item.path}/${item.name}`);
            }
        }
        else {
            const fileName = getFileName(item.name);
            const fileExtensionName = getFileExtension(item.name);
            console.log('fileNamefunc\n', fileName);
            console.log('fileExtensionName\n', fileExtensionName);
            if (fileExtensionName === "docx") {
                const result = await mammoth_1.default.convertToHtml({ path: `${item.path}/${item.name}` });
                var html = result.value; // The generated HTML
                // Generate PDF from this HTML
                const pdfOutputPath = path_1.default.join(`${item.path}`, `.${item.name}.pdf`);
                await createPdfFromHtml(html, pdfOutputPath);
                // await mammoth.convertToHtml({path: `${item.path}/${item.name}`})
                // .then(function(result){
                //     var html = result.value; // The generated HTML
                //     // @ts-ignore
                //     var messages = result.messages; // Any messages, such as warnings during conversion
                //     console.log('DocsToHtml\n', html);
                // })
                // .catch(function(error) {
                //     console.error(error);
                // });
            }
            if (fileExtensionName === "pdf") {
                const [texts, pageNumbers] = await (0, getDataFromOCR_1.getTextDataFromOCR)(item.name, `${item.path}/${item.name}`);
                (0, dataDev_1.saveDevData)(`${item.name}.json`, { texts, pageNumbers });
            }
            else if (fileExtensionName === "docx") {
                const result = await mammoth_1.default.convertToHtml({ path: `${item.path}/${item.name}` });
                var html = result.value; // The generated HTML
                // Generate PDF from this HTML
                const pdfOutputPath = path_1.default.join(`${item.path}`, `.${fileName}.pdf`);
                await createPdfFromHtml(html, pdfOutputPath);
                const [texts, pageNumbers] = await (0, getDataFromOCR_1.getTextDataFromOCR)(item.name, pdfOutputPath);
                (0, dataDev_1.saveDevData)(`${item.name}.json`, { texts, pageNumbers });
                // await mammoth.convertToHtml({path: `${item.path}/${item.name}`})
                // .then(function(result){
                //     var html = result.value; // The generated HTML
                //     // @ts-ignore
                //     var messages = result.messages; // Any messages, such as warnings during conversion
                //     console.log('DocsToHtml\n', html);
                // })
                // .catch(function(error) {
                //     console.error(error);
                // });
            }
        }
    }
}
async function readDirectoryStructure(dirPath) {
    let results = [];
    let fileCount = 0; // Initialize file count
    const dirItems = await (0, promises_1.readdir)(dirPath, {
        encoding: 'utf-8',
        withFileTypes: true,
    });
    for (const item of dirItems) {
        if (item.isDirectory()) {
            if (item.name != 'lancedb') {
                const { tree: children, fileCount: subFileCount } = await readDirectoryStructure(`${item.path}/${item.name}`);
                fileCount += subFileCount;
                results.push({ isFolder: true, name: item.name, fullPath: `${item.path}/${item.name}`, children });
                // mainWindow.webContents.send('loading-progress', progress);
            }
        }
        else {
            fileCount++;
            results.push({ isFolder: false, name: item.name, fullPath: `${item.path}/${item.name}` });
        }
    }
    // return results
    return { tree: results, fileCount };
}
const createFolderWorkSpace = async (_workspaceInfo) => {
    const pathTest = "/home/mathieug/Work/with_electron_next_js_app/electron_project/public";
    const caseContextTest = `Au cours d'une bagarre générale dans le Tramway, la victime Mahamadou DIAMNE, recevait un coup de couteau dans la\njambe, lui occasionnant 5 joursd'ITT. Il désignait deux individus  avant d'en innocenter un au cours d'une\nconfrontation : Bilal Rachid et il désignait formellement le second :  Hamid Yassine.`;
    const summaryExpectationsTest = `rechercher dans le texte les différents éléments pouvant démontrer 1. la culpabilité ou 
    2. l'innocence des accusés : temoignage, video, arme du crime, telephone, presence sur les lieux,
    vidéosurveillance, contradiction, etc. Il faut ignorer tous les faits de procédure : deferement devant le parquet, mise en garde a vue, traductrice, lecture des droits, etc.`;
    if (0) {
        const summaryInstruction = await (0, getSummaryInstructionRefined_1.getSummaryInstructionRefined)(summaryExpectationsTest);
        console.log(summaryInstruction);
    }
    // @ts-ignore
    const summaryInstructionRefinedStep1 = `
    - Analyser le texte pour repérer tous les témoignages mentionnés et déterminer s’ils suggèrent la culpabilité ou l’innocence des accusés.
    - Chercher dans le texte toute mention de vidéos qui pourraient soit accabler soit disculper les accusés.
    - Identifier la présence ou la description de l’arme du crime et évaluer si elle est liée à un ou plusieurs accusés.
    - Rechercher dans le texte des informations relatives à l'usage de téléphones qui pourraient fournir des alibis ou impliquer les accusés.
    - Examiner le texte pour localiser les preuves indiquant la présence des accusés sur les lieux du crime.
    - Trouver les références à des systèmes de vidéosurveillance pouvant confirmer ou infirmer la présence des accusés sur les lieux.
    - Détecter toute contradiction dans les déclarations ou les témoignages qui pourrait affecter la crédibilité de l'accusation ou de la défense.
    - Explorer la possibilité d'un alibi via des éléments dans le texte qui prouvent que l'accusé n'était pas sur les lieux.
    - Fouiller le texte à la recherche de preuves matérielles qui pourraient être liées directement ou indirectement aux accusés.
    - Évaluer les éléments qui indiquent une manipulation ou un manque de fiabilité de la preuve vidéo ou des témoignages.
    - Examiner les informations qui concernent les communications téléphoniques des accusés pour établir des motifs ou des contradictions avec les faits allégués.
    - Rechercher des informations sur des possibles fausses accusations ou erreurs judiciaires liées à des éléments mal interprétés ou falsifiés.
    - Identifier toute référence à des éléments de preuves non pertinents pour ignorer ces faits du processus d'analyse.`;
    // @ts-ignore
    const summaryInstructionRefinedStep2 = `
    - Lisez attentivement chaque paragraphe pour détecter et noter les témoignages mentionnés, en précisant si le témoignage pointe vers la culpabilité ou l'innocence des accusés, en utilisant des mots-clés tels que "accusé admet", "témoin a vu", "n’a jamais vu l'accusé".
    - Recherchez et signalez toute mention de vidéos dans le texte, en décrivant si leur contenu semble accabler ou disculper les accusés, avec des détails comme "vidéo de surveillance", "enregistré au moment du crime".
    - Identifiez les passages décrivant l'arme du crime et évaluez si et comment elle est liée à chaque accusé, en recherchant des expressions comme "arme retrouvée avec", "empreintes sur l'arme".
    - Fouillez le texte en quête de détails sur l'usage de téléphones par les accusés, en relevant si les informations sur l’heure et la localisation des appels peuvent servir d'alibis ou d'incriminations, en utilisant les termes "appel log", "localisation du téléphone".
    - Examinez toute preuve textuelle ou description indiquant la présence des accusés sur les lieux du crime, comme "vu sur les lieux", "surveillance vidéo au moment du".
    - Cherchez des références à des systèmes de vidéosurveillance et précisez si elles confirment la présence des accusés ou non, avec des détails sur l'heure et l'emplacement des caméras relevant "images de surveillance", "caméra hors service".
    - Détectez et notez d'éventuelles contradictions dans les déclarations ou témoignages et évaluez leur impact sur la crédibilité des parties concernées, en signalant des phrases comme "déclaré initialement", "changé de déclaration".
    - Recherchez et documentez des preuves d'un alibi solide pour chaque accusé, telles que des témoignages ou des preuves matérielles prouvant qu'il ne se trouvait pas sur les lieux, à l’aide de mots-clés "confirmé par", "autre localisation au moment du".
    - Analysez les éléments matérielles signalés dans le texte comme possiblement liés aux accusés, tels que des vêtements, des outils, ou des documents, en scrutant des termes "retrouvé sur", "possession de".
    - Évaluez si des manipulations de preuve vidéo ou des témoignages sont suggérées, en cherchant des segments de texte avec "preuve altérée", "doute sur l'authenticité".
    - Étudiez les communications téléphoniques des accusés pour des motifs ou des contradictions avec les faits allégués, en utilisant des expressions comme "appel suspect", "heure des appels incohérente".
    - Vérifiez l'existence de fausses accusations ou d'erreurs judiciaires, en recherchant des indications telles que "preuve contestée", "nouvelles découvertes".
    - Ignorez les éléments de preuves jugés non pertinents en les distinguant grâce à des formulations comme "sans rapport", "irrélevant pour l'affaire".
    - Lisez attentivement chaque paragraphe pour détecter et noter les témoignages mentionnés, en précisant si le témoignage pointe vers la culpabilité ou l'innocence des accusés, en utilisant des mots-clés tels que "accusé admet", "témoin a vu", "n’a jamais vu l'accusé".
    - Recherchez et signalez toute mention de vidéos dans le texte, en décrivant si leur contenu semble accabler ou disculper les accusés, avec des détails comme "vidéo de surveillance", "enregistré au moment du crime".
    - Identifiez les passages décrivant l'arme du crime et évaluez si et comment elle est liée à chaque accusé, en recherchant des expressions comme "arme retrouvée avec", "empreintes sur l'arme".
    - Fouillez le texte en quête de détails sur l'usage de téléphones par les accusés, en relevant si les informations sur l’heure et la localisation des appels peuvent servir d'alibis ou d'incriminations, en utilisant les termes "appel log", "localisation du téléphone".
    - Examinez toute preuve textuelle ou description indiquant la présence des accusés sur les lieux du crime, comme "vu sur les lieux", "surveillance vidéo au moment du".
    - Cherchez des références à des systèmes de vidéosurveillance et précisez si elles confirment la présence des accusés ou non, avec des détails sur l'heure et l'emplacement des caméras relevant "images de surveillance", "caméra hors service".
    - Détectez et notez d'éventuelles contradictions dans les déclarations ou témoignages et évaluez leur impact sur la crédibilité des parties concernées, en signalant des phrases comme "déclaré initialement", "changé de déclaration".
    - Recherchez et documentez des preuves d'un alibi solide pour chaque accusé, telles que des témoignages ou des preuves matérielles prouvant qu'il ne se trouvait pas sur les lieux, à l’aide de mots-clés "confirmé par", "autre localisation au moment du".
    - Analysez les éléments matérielles signalés dans le texte comme possiblement liés aux accusés, tels que des vêtements, des outils, ou des documents, en scrutant des termes "retrouvé sur", "possession de".
    - Évaluez si des manipulations de preuve vidéo ou des témoignages sont suggérées, en cherchant des segments de texte avec "preuve altérée", "doute sur l'authenticité".
    - Étudiez les communications téléphoniques des accusés pour des motifs ou des contradictions avec les faits allégués, en utilisant des expressions comme "appel suspect", "heure des appels incohérente".
    - Vérifiez l'existence de fausses accusations ou d'erreurs judiciaires, en recherchant des indications telles que "preuve contestée", "nouvelles découvertes".
    - Ignorez les éléments de preuves jugés non pertinents en les distinguant grâce à des formulations comme "sans rapport", "irrélevant pour l'affaire".`;
    // 1. Obtenir la structure des fichiers
    // @ts-ignore
    const { tree: dirItems, fileCount } = await readDirectoryStructure(_workspaceInfo.folderPath);
    // const { tree: dirItems, fileCount } = await readDirectoryStructure(dirPath);
    console.log('fileCount\n', fileCount);
    // 2. Creer la vector database ! 
    let table;
    if (0) {
        table = await (0, getVectorDatabaseTable_1.getVectorDatabaseTable)(pathTest);
    }
    // 3. Obtenir le texte des documents
    if (1) {
        console.time("ocr");
        await createJsonFileFromExtractingTextFromDocDirWithOCR(_workspaceInfo.folderPath);
        console.timeEnd("ocr"); // https://medium.com/@kirankandel007/measuring-execution-time-in-nodejs-1d4179eeb860
    }
    if (0) {
        await fillVectorDatabaseWithTextFromDocDir(_workspaceInfo.folderPath, table);
    }
    // first solution
    if (0) {
        const listInfoDocs = await getWholeInfoFromEachDocFromEachFolderUsingLLM(pathTest, summaryExpectationsTest, caseContextTest);
        const finalSummary = await (0, getSummaryFromDoc_1.getFinalSummaryFromDocsWithLLM)(listInfoDocs, caseContextTest, summaryExpectationsTest);
        console.log('\n\n***result getFinalSummaryFromDocs***\n\n', finalSummary);
    }
    // seconde solution 
    if (0) {
        const textsStringFromAllDocs = await (0, secondSolutionForSummary_1.getAllTextFromAllDocsInOneString)(pathTest);
        // @ts-ignore
        const summary = await (0, secondSolutionForSummary_1.getSummaryAllAtOnce)(textsStringFromAllDocs, summaryExpectationsTest);
    }
    // troisième solution
    console.time("llm");
    const summaryExpectationsRaph = `rechercher dans le texte les différents éléments
    explicant les règles de droit des etats-unis et de l'europe concernant les normes à respecter pour un producteur de dispositif
    médical qui collecte des données à caractère personnel (DCP). Reponds sous la forme de bullet point dans chaque partie nécessaire`;
    if (1) {
        const textsArrayFromAllDocs = await (0, thirdSolutionForSummary_1.getAllTextFromAllDocsInArray)(pathTest);
        // @ts-ignore
        const summary = await (0, thirdSolutionForSummary_1.getSummaryByRecursivity)(textsArrayFromAllDocs, summaryExpectationsRaph);
        console.log('summary\n', summary);
    }
    console.timeEnd("llm"); // https://medium.com/@kirankandel007/measuring-execution-time-in-nodejs-1d4179eeb860
    // quatrième solution
    if (0) {
    }
    return dirItems;
};
exports.createFolderWorkSpace = createFolderWorkSpace;
/**
 * TODO : zod pour controler l'input
 * il faut pas que le folderPath soit vide : seule contrainte
 */ 
