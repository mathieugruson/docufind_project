"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryFromDoc = exports.getFinalSummaryFromDocsWithLLM = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_2 = require("langchain/output_parsers");
const zod_1 = require("zod");
const getFinalSummaryFromDocsWithLLM = async (listInfoDocs, caseContextTest, summaryExpectations) => {
    const chain2 = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(`Voici le context du dossier judiciaire dans lequel je travaille : 
        {caseContextTest}

        Ci-dessous se trouve la liste de toutes les informations pertinentes qui ont éte trouvés pour répondre
        &&&\n
        {listInfoDocs}\n
        &&&\n\n

        A la lumiere des instructions suivantes encerclées par (***) :
        ***
        {summaryExpectations}\n
        ***
        Fais la synthèse la plus experte possible et la plus exhaustive possible pour répondre de la maniere la plus exhaustive possible, il faut
        être factuel et précis et n'ignorer aucune information. Tu peux expliquer pourquoi les éléments te semblent être des informations pertinentes 
        `),
        new openai_1.ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-4-1106-preview",
            // verbose: true
        }),
        new output_parsers_1.StringOutputParser(),
    ]);
    const result = await chain2.invoke({ caseContextTest: caseContextTest, listInfoDocs: listInfoDocs, summaryExpectations: summaryExpectations });
    console.log('result\n', result);
    return result;
};
exports.getFinalSummaryFromDocsWithLLM = getFinalSummaryFromDocsWithLLM;
const getRelevantInfo = async (text, summaryInstruction, infoAlreadyGathered, caseContextTest) => {
    try {
        const parser = output_parsers_2.StructuredOutputParser.fromZodSchema(zod_1.z.array(zod_1.z.object({
            info: zod_1.z.string().describe("Information dans le document qui répond de manière certaine et pertinente à la demande de l'utilisateur"),
            explication: zod_1.z.string().describe("Explication pourquoi et comment cette information répond à cette demande"),
        })));
        // @ts-ignore
        const chain = runnables_1.RunnableSequence.from([
            prompts_1.PromptTemplate.fromTemplate(`
        Je travaille sur un dossier judiciare dont voici le context entre $$$ : 
        $$$
        {caseContextTest}
        $$$
        Je viens de recevoir de nouvelles informations concernant ce dossier encerclé par *** :
        ***
        {content}
        *** 
        Dans un premier temps, je dois analyser ce nouveau contenu et en extraire les informations pertinentes qui répondent cette consigne : {summaryInstruction}\n
        {format_instructions}
        Il faut répondre en francais.
        En cas, d'incapacité à répondre, il faut renvoyer un array vide []
        `),
            new openai_1.ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-4-1106-preview",
                // verbose: true
            }),
            parser
        ]);
        const relevantInfoFromText = await chain.invoke({ content: text, summaryInstruction: summaryInstruction, caseContextTest: caseContextTest, format_instructions: parser.getFormatInstructions() });
        console.log('relevantInfoFromText\n', relevantInfoFromText);
        const relevantInfoFromTextListArray = relevantInfoFromText.map((item) => {
            return item.info;
        });
        const relevantInfoFromTextListString = relevantInfoFromTextListArray.join('\n -');
        const parser2 = output_parsers_2.StructuredOutputParser.fromZodSchema(zod_1.z.array(zod_1.z.object({
            info: zod_1.z.string().describe("Information qui n'est pas déjà mentionnée"),
        })));
        // @ts-ignore
        const chain2 = runnables_1.RunnableSequence.from([
            prompts_1.PromptTemplate.fromTemplate(`
          Je travaille sur un dossier judiciaire dont voici le context : {caseContextTest}\n\n
          J'ai déja une liste d'information qui m'est parvenu au sujet de ce dossier judiciaire encerclé par des ***, si c'est le debut du dossier elle peut être vide :
          ***
          {infoAlreadyGathered}
          ***
          
          Je viens de recevoir de nouvelles informations : 
          {relevantInfoFromTextListString}
          
          Il faut que tu me renvoie la liste des nouvelles informations qui ne sont pas déja présentes dans la première liste.
          Si la liste est vide, renvoie toutes les informations.
          {format_instructions}
          Répond en français
          En cas, d'incapacité à répondre, il faut renvoyer un array vide []
          `),
            new openai_1.ChatOpenAI({
                maxRetries: 3,
                temperature: 0,
                modelName: "gpt-4-1106-preview",
                // verbose: true
            }),
            parser2
        ]);
        const onlyNewRelevantInfoFromText = await chain2.invoke({ caseContextTest: caseContextTest, infoAlreadyGathered: infoAlreadyGathered, relevantInfoFromTextListString: relevantInfoFromTextListString, format_instructions: parser2.getFormatInstructions() });
        console.log('onlyNewRelevantInfoFromText\n', onlyNewRelevantInfoFromText);
        const tmp = onlyNewRelevantInfoFromText.map((item) => {
            return item.info;
        });
        const onlyNewRelevantInfoFromTextString = tmp.join('\n- ');
        return onlyNewRelevantInfoFromTextString;
    }
    catch (error) {
        console.error(error);
        return "";
    }
};
const getSummaryFromDoc = async (texts, summaryInstruction, listInfoDocs, caseContextTest) => {
    let relevantInformationList = `La liste est vide, sauf s'il y a des éléments après`;
    for (const text of texts) {
        const listInfoTmp = listInfoDocs + relevantInformationList;
        const relevantInfoToAdd = await getRelevantInfo(text, summaryInstruction, listInfoTmp, caseContextTest);
        relevantInformationList += relevantInfoToAdd;
    }
    console.log('relevantInformationList\n', relevantInformationList);
    return relevantInformationList;
};
exports.getSummaryFromDoc = getSummaryFromDoc;
