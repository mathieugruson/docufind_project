"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRetrieverResult = exports.loadDevData = void 0;
// import * as uuid from "uuid";
const openai_1 = require("@langchain/openai");
// import { OpenAI } from "@langchain/openai";
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { InMemoryStore } from "langchain/storage/in_memory";
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const documents_1 = require("@langchain/core/documents");
const text_splitter_1 = require("langchain/text_splitter");
// import { LanceDB } from "@langchain/community/vectorstores/lancedb";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { CustomListOutputParser } from "@langchain/core/output_parsers";
// import { saveDevData } from "./dataDev";
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const dataDirectory = './dev_files';
const loadDevData = (filename) => {
    try {
        const filePath = path.join(dataDirectory, filename);
        const data = fs.readFileSync(filePath, 'utf8');
        const specificQuestionsArray = JSON.parse(data);
        console.log('specificQuestionsArray ', specificQuestionsArray);
        const test = specificQuestionsArray.map((item) => {
            console.log('**page array**\n', item);
            const questions = JSON.parse(item);
            questions.map((question) => {
                console.log('loadDevData: \n', question);
            });
            return questions;
        });
        return test;
    }
    catch (error) {
        console.error('Error reading data from file:', error);
        return null;
    }
};
exports.loadDevData = loadDevData;
// MULTI VECTOR 
const getRetrieverResult = async (texts, _pagesNumber, _fileNamePath, _table) => {
    // With a `CustomListOutputParser`, we can parse a list with a specific length and separator.
    // const parser = new CustomListOutputParser({ separator: "\n" });
    // const parser = new CustomListOutputParser({ length: 3 });
    const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
        separators: ["|", "\n"],
    });
    let questionsArray = [];
    for (const [index, text] of texts.entries()) {
        const docOutput = await splitter.splitText(text);
        const chain2 = runnables_1.RunnableSequence.from([
            {
                content: (input) => input.content,
                format_instructions: (input) => input.format_instructions
            },
            prompts_1.PromptTemplate.fromTemplate(`
          {content}\n\n
          {format_instructions}`),
            new openai_1.ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-3.5-turbo",
                verbose: true
            }),
            // parser,
            new output_parsers_1.StringOutputParser(),
        ]);
        // console.log('texts :', texts);
        // trois string du text divise de maniere structures
        const batchInputs = docOutput.map((chunk) => {
            const batchInput = {
                content: chunk,
                format_instructions: `
              Ce text est issu d'une procedure judiciaire et d'une OCR.
              Il faut retranscrire le texte sans coquille et ajouter en dessous toutes les questions de maniere exhaustive dont les reponses
              se trouvent dans le texte et seulement dans le texte.
              Exemple : 
              text\n\n
              - question 1
              - question 2
              - etc.
              
          Ne pas ajouter de phrase d'introduction ou de conclusion : ne mettre que le text et les questions.`
            };
            return batchInput;
        });
        // ici on envoie les 3 parties pour avoir les questions
        const summaries = await chain2.batch(batchInputs, {}, {
            maxConcurrency: 5,
        });
        summaries.map((pageArray) => {
            questionsArray.push(new documents_1.Document({
                pageContent: pageArray,
                metadata: {
                    'fileNamePath': _fileNamePath,
                    'pageNumber': index,
                },
            }));
        });
    }
    return questionsArray;
};
exports.getRetrieverResult = getRetrieverResult;
/**
 *               Ce text est issu d'une procedure judiciaire et d'une OCR.
              Il faut retranscrire le texte sans coquille et ajouter en dessous toutes les questions, de maniere exhaustive,
              complete qu'un avocat pourrait pour arriver a ce texte dans une recherche en langage naturel detaille, approfondi et global.
 *
 *         "text": "PROCÈS-VERBAL D'INTERPELLATION\n\nEn fonction à Saint Denis, Réunion, avec armes, agent de police judiciaire en résidence à Saint Denis.\n\nOBJET :\nProcès-verbal d'interpellation.\n\n- Étant de service.\n- Agissant conformément aux instructions de Monsieur LE BARS David, Commissaire Divisionnaire de Police, Chef du deuxième district.\n- Assistés du Gardien de la Paix DUBOIS et de l'adjoint de sécurité OBERLIN, tous revêtus de nos tenues uniformes et munis de nos insignes réglementaires.\n\nCe texte est issu d'une procédure judiciaire et d'une OCR. Il faut retranscrire le texte sans coquille et ajouter en dessous toutes les questions, de manière exhaustive, complète qu'un avocat pourrait poser pour arriver à ce texte dans une recherche en langage naturel détaillé, approfondi et global.\n\n- Quelle est la nature de la procédure judiciaire dont ce texte est issu ?\n- Qu'est-ce que l'OCR et en quoi est-il pertinent dans ce contexte ?\n- Qui est Monsieur LE BARS David et quel est son rôle dans cette affaire ?\n- Quelles sont les fonctions du Commissaire Divisionnaire de Police ?\n- Quel est le rôle du deuxième district dans cette affaire ?\n- Qui sont le Gardien de la Paix DUBOIS et l'adjoint de sécurité OBERLIN et quel est leur rôle dans cette interpellation ?\n- Quelles sont les tenues et insignes réglementaires dont les agents de police sont munis lors de cette interpellation ?\n- Quelles sont les circonstances entourant cette interpellation ?\n- Quelles sont les armes utilisées par l'agent de police judiciaire lors de cette interpellation ?\n- Quelles sont les mesures prises pour assurer la sécurité lors de cette interpellation ?\n- Quelles sont les étapes suivantes de la procédure judiciaire après cette interpellation ?",
 * pas mal pour avoir les questions qu'un avocat pourrait se poser
 *
 */ 
