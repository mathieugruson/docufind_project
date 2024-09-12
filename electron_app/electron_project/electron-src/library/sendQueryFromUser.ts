
import { connect } from "vectordb";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const getAnswerFromLLM = async (similaritySearchResult : any, userPrompt: string) : Promise<any> => {
            
    const concatenatedString = similaritySearchResult.join("\n");
    console.log('concatenatedString\n', concatenatedString);
    

// You can also create a chain using an array of runnables
    const chain2 = RunnableSequence.from([
        PromptTemplate.fromTemplate(
            `{answerContent}\n\n
            Synthetise les resultat ci-dessus pour repondre a la question suivante si c'est possible : {userPrompt} \n\n`
            ),
            new ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-3.5-turbo-1106",
                // verbose: true
              }),
              new StringOutputParser(),
            ]);

    const result = await chain2.invoke({ answerContent: concatenatedString, userPrompt: userPrompt});
    console.log('result\n', result);
    
            
    return result


}


export const sendQueryFromUser = async (queryFromUser: string): Promise<any> => {

    /**
     * peut-etre selon la question il faudra demander les meilleurs mots cles pour faire ressort les resultat mais normalement pas necessaire
     */
    const uri = "./public/lancedb"
    const db = await connect(uri);
    const table = await db.openTable("general_db");
  
    const vectorStore = new LanceDB(new OpenAIEmbeddings(), { table });
  
    
    const result = await vectorStore.similaritySearch(queryFromUser, 10);

    const promptAnswer = getAnswerFromLLM(result.map((item : any) => item.pageContent), queryFromUser)
    
    console.log(promptAnswer);
        

    return promptAnswer
}

            /**
             * 
             * - il faut rajouter un separateur pour pouvoir splitter le text et pas mettres les questions
             * 
             * ici il faudra implementer la logic ou l'on donne ces donnes a la LLM pour recuperer l'information precise
             * on le fera en bouclant sur les resultat et des qu'on trouve, on arrete et on structure la reponse comme cela
             * 
             *  {
             *      responseContent : 
             *      filePath : 
             *      pageNumber : 
             *  }
             * 
             */
        