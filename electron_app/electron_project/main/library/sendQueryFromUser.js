"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendQueryFromUser = void 0;
const vectordb_1 = require("vectordb");
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const lancedb_1 = require("@langchain/community/vectorstores/lancedb");
const openai_2 = require("langchain/embeddings/openai");
const getAnswerFromLLM = async (similaritySearchResult, userPrompt) => {
    const concatenatedString = similaritySearchResult.join("\n");
    console.log('concatenatedString\n', concatenatedString);
    // You can also create a chain using an array of runnables
    const chain2 = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(`{answerContent}\n\n
            Synthetise les resultat ci-dessus pour repondre a la question suivante si c'est possible : {userPrompt} \n\n`),
        new openai_1.ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-3.5-turbo-1106",
            // verbose: true
        }),
        new output_parsers_1.StringOutputParser(),
    ]);
    const result = await chain2.invoke({ answerContent: concatenatedString, userPrompt: userPrompt });
    console.log('result\n', result);
    return result;
};
const sendQueryFromUser = async (queryFromUser) => {
    /**
     * peut-etre selon la question il faudra demander les meilleurs mots cles pour faire ressort les resultat mais normalement pas necessaire
     */
    const uri = "./public/lancedb";
    const db = await (0, vectordb_1.connect)(uri);
    const table = await db.openTable("general_db");
    const vectorStore = new lancedb_1.LanceDB(new openai_2.OpenAIEmbeddings(), { table });
    const result = await vectorStore.similaritySearch(queryFromUser, 10);
    const promptAnswer = getAnswerFromLLM(result.map((item) => item.pageContent), queryFromUser);
    console.log(promptAnswer);
    return promptAnswer;
};
exports.sendQueryFromUser = sendQueryFromUser;
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
