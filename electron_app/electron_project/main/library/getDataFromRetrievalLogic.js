"use strict";
// import * as uuid from "uuid";
// import { ChatOpenAI } from "@langchain/openai";
// import { OpenAI } from "@langchain/openai";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromRetrievalLogic = exports.getDataToEmbedInVdb = void 0;
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { InMemoryStore } from "langchain/storage/in_memory";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { StringOutputParser } from "@langchain/core/output_parsers";
// import { RunnableSequence } from "@langchain/core/runnables";
const documents_1 = require("@langchain/core/documents");
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
const lancedb_1 = require("@langchain/community/vectorstores/lancedb");
const openai_1 = require("langchain/embeddings/openai");
// import { LanceDB } from "@langchain/community/vectorstores/lancedb";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { CustomListOutputParser } from "@langchain/core/output_parsers";
// import { saveDevData } from "./dataDev";
// import * as fs from "node:fs";
// import * as path from "node:path";
/**
 * Goal : just put the text and see
 * Result :
 */
const getDataToEmbedInVdb = async (texts, _pagesNumber, _fileNamePath, _table) => {
    let questionsArray = [];
    texts.map((pageArray, index) => {
        questionsArray.push(new documents_1.Document({
            pageContent: pageArray,
            metadata: {
                'fileNamePath': _fileNamePath,
                'pageNumber': index,
            },
        }));
    });
    return questionsArray;
};
exports.getDataToEmbedInVdb = getDataToEmbedInVdb;
const getDataFromRetrievalLogic = async (texts, pagesNumber, fileNamePath, table) => {
    // https://js.langchain.com/docs/modules/data_connection/
    const specificQuestionsForDb = await (0, exports.getDataToEmbedInVdb)(texts, pagesNumber, fileNamePath, table);
    const textsBis = specificQuestionsForDb.map((item) => item.pageContent);
    const metaData = specificQuestionsForDb.map((item) => item.metadata);
    await lancedb_1.LanceDB.fromTexts(textsBis, metaData, new openai_1.OpenAIEmbeddings(), { table });
    return 1;
};
exports.getDataFromRetrievalLogic = getDataFromRetrievalLogic;
// Goal : Extraire des questions de petits chunks de data 
// Result : lack of context, to small
// export const getDataToEmbedInVdb = async (texts : string[], _pagesNumber : number[], _fileNamePath: string, _table: any) => {
//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 500,
//       chunkOverlap: 100,
//       separators: ["|", "\n"],
//     });
//     let questionsArray : any[] = []
//     for (const [index, text] of texts.entries()) {
//       const splittedTexts = await splitter.splitText(text);
//       const batchInputs = splittedTexts.map((chunk : string) => {
//           const batchInput = {
//             content : chunk, 
//             format_instructions: `
//             Ce text est issu d'une procedure judiciaire et d'une OCR.
//             Il faut retranscrire le texte sans coquille et ajouter en dessous toutes les questions de maniere exhaustive dont les reponses
//             se trouvent dans le texte et seulement dans le texte.
//             Ne jamais utilise il ou elle, mais mettre le nom de la personne et son role.
//             Exemple : 
//             text\n\n
//             - Quel est le numero de telephone de Monsieur X, la victime ?
//             - question 2
//             - question 3
//             - question 3
//         Ne pas ajouter de phrase d'introduction ou de conclusion : ne mettre que le text et les questions.`
//           }
//           return batchInput
//       })
//       const chain = RunnableSequence.from([
//           {
//             content: (input: any) => input.content,
//             format_instructions: (input: any) => input.format_instructions
//           },
//           PromptTemplate.fromTemplate(`
//           {content}\n\n
//           {format_instructions}`),
//           new ChatOpenAI({
//             maxRetries: 3,
//             temperature: 0,
//             modelName: "gpt-3.5-turbo",
//             verbose: true
//           }),
//           // parser,
//           new StringOutputParser(),
//         ]);
//         const summaries = await chain.batch(
//           batchInputs,
//           {},
//           {
//             maxConcurrency: 5,
//           }
//           );
//           summaries.map((pageArray : any) => {
//           questionsArray.push(new Document({
//             pageContent: pageArray,
//             metadata: {
//               'fileNamePath' : _fileNamePath,
//               'pageNumber' : index,
//             },
//           }))
//       })
//     }
//       return questionsArray 
// }
