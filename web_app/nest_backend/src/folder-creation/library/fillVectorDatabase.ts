
import { Document } from "@langchain/core/documents";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';
import { loadJsonData } from "./loadJsonData";
import { OpenAIEmbeddingFunction } from "vectordb";
import * as crypto from 'crypto';
import { encryptString, decryptString } from "src/encryption/library/encryptionString";



export const getDataToEmbedInVdb = async (texts : string[], _pagesNumber : number[], fileNamePath: string, _table: any) => {

  // TODO il faudrait mettre ici le path ds le contenu ? on peut essayer mais avant revoir la doc LLM

  let questionsArray : Document[] = []

  // regex pour enlever le path intern
  const safeFullPath = fileNamePath.replace(/^(.*?\/){3}/, '');
  console.log('safeFullPath\n', safeFullPath);

  texts.map((pageArray : any, index : number) => {
    questionsArray.push(new Document({
      pageContent: `<span>${safeFullPath} page ${index}</span>\n${pageArray}`,
      metadata: {
        'fileNamePath' : fileNamePath,
        'pageNumber' : index,
      },
    }))
  })
  
  return questionsArray 
    
}


const embedDocuments = async (textToEmbed : string) => {

  const openAIKey = process.env.OPENAI_API_KEY;

  console.log('openAIKey\n', openAIKey);
  
  // The name of the source column, in this case, let's assume it's a simple string input
  const sourceColumn = 'text';

  // The model name you want to use for embeddings
  const modelName = 'text-embedding-ada-002'; // This is the default value as per your description

  // Create an instance of the OpenAIEmbeddingFunction
  const embeddingFunction = new OpenAIEmbeddingFunction(sourceColumn, openAIKey, modelName);
  // I face a bug due to openai package version, i have downgraded : https://github.com/lancedb/lancedb/issues/506


  // Use the embed method to get the vector representation of the text
  const vector = await embeddingFunction.embed([textToEmbed])
  
  return vector 
  
}

export const fillVectorDatabaseWithRetrievalLogic = async (texts : string[], pagesNumber : number[], fileNamePath: string, table: any): Promise<any> => {
    /*
  Some resources that helped me : 
  - https://lancedb.github.io/lancedb/javascript/classes/OpenAIEmbeddingFunction/
  - https://api.js.langchain.com/classes/langchain_community_vectorstores_lancedb.LanceDB.html#constructor
  - https://js.langchain.com/docs/modules/data_connection/

    Rationae :
    1. Create the Document format with all information
    2. Create the vectors from openAIEmbeddings with the text
    3. stock these vectors with the text encrypted for security reason
    This logic made us able to retrieve the data with similarity search while not giving-up on security
  */

  const specificQuestionsForDb = await getDataToEmbedInVdb(texts, pagesNumber, fileNamePath, table)
  
  const lanceDBInstance = new LanceDB(new OpenAIEmbeddings(), { table });
  
  for (const item of specificQuestionsForDb) {
    // Encrypt the pageContent before embedding and storing
    item.pageContent = encryptString(item.pageContent);

    const vector = await embedDocuments(item.pageContent); // Assuming this function can handle encrypted content or is focused on the metadata
    await lanceDBInstance.addVectors(vector, [item]);
  }

  return 1

}

async function fillVectorDatabaseWithTextFromDocDir(dirPath: string, table : any): Promise<any> {

  const dirItems: Dirent[] = await readdir(dirPath, {
      encoding: 'utf-8',
      withFileTypes: true,
  })
      
  for (const item of dirItems) {
      if (item.isDirectory()) {
          if (item.name != '.dev') {
              await fillVectorDatabaseWithTextFromDocDir(`${item.path}/${item.name}`, table);
          }
      } else {
          console.log('fileName path in VectorDB\n', `${item.path}/${item.name}`);
          
          const DataFromTextJson = loadJsonData(item.path, `${item.name}.json`);
          await fillVectorDatabaseWithRetrievalLogic(DataFromTextJson.texts, DataFromTextJson.pageNumbers, `${item.path}/${item.name}`, table) // https://js.langchain.com/docs/modules/data_connection/  
      }    
  }

}


export default fillVectorDatabaseWithTextFromDocDir


 
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
