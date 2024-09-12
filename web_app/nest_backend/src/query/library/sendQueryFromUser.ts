
import { connect } from "vectordb";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import * as crypto from 'crypto';
import { decryptString } from "src/encryption/library/encryptionString";

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64

const getAnswerFromLLM = async (similaritySearchResult : any, userPrompt: string) : Promise<any> => {
            
    const concatenatedString = similaritySearchResult.join("\n");    

// You can also create a chain using an array of runnables
    const chain2 = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            `{answerContent}\n\n
            Synthetise les resultat ci-dessus pour repondre a la question suivante si c'est possible : {userPrompt} \n\n
            
            Il faut toujours justifier l'origine de tes informations pour qu'on puisse vérifier. Au dessus de chaque partie de texte est indiqué l'origine du texte :
            x/x/x/x/.pdf page [X]. Il faut absolument écrire comme cela cette source pour qu'elle puisse être parsé ensuite : 
            (<span>x/x/x/x/.pdf page [X]</span>).  
            `
            ),
            new ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-4-1106-preview",
                // verbose: true
              }),
              new StringOutputParser(),
            ]);

    const result = await chain2.invoke({ answerContent: concatenatedString, userPrompt: userPrompt});    
            
    return result


}

export const sendQueryFromUser = async (queryFromUser: string, dataBasefolderPath : string): Promise<any> => {

    const db = await connect(dataBasefolderPath);
    const table = await db.openTable("general_db");
  
    const vectorStore = new LanceDB(new OpenAIEmbeddings(), { table });
  
    const result = await vectorStore.similaritySearch(queryFromUser, 10);

    // console.log('result similaritySerach\n', result);
    console.log('\nSEND QUERY\n');
    
    const decryptedResults = result.map(item => {
        return {
            ...item,
            pageContent: decryptString(item.pageContent)
        };
    });

    if (1) {
        const promptAnswer = await getAnswerFromLLM(decryptedResults.map((item : any) => item.pageContent), queryFromUser)
        console.log('\nRETURN PROMPT ANSWER\n', promptAnswer);
        return promptAnswer
    }
    
    console.log('RETURN QUERY FROM USER');
    
    return queryFromUser
}

