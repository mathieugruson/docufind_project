import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";

export const getFinalSummaryFromDocsWithLLM = async (listInfoDocs : string , caseContextTest : string, summaryExpectations : string) => {

    const chain2 = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `Voici le context du dossier judiciaire dans lequel je travaille : 
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
        new ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-4-1106-preview",
            // verbose: true
          }),
          new StringOutputParser(),
        ]);

    const result = await chain2.invoke({ caseContextTest : caseContextTest, listInfoDocs: listInfoDocs, summaryExpectations: summaryExpectations});
    
    console.log('result\n', result);
    
    return result

}


const getRelevantInfo = async (text : string, summaryInstruction : string, infoAlreadyGathered : string, caseContextTest : string) : Promise<string> => {

  try {
    
  const parser = StructuredOutputParser.fromZodSchema(z.array(
    z.object({
      info: z.string().describe("Information dans le document qui répond de manière certaine et pertinente à la demande de l'utilisateur"),
      explication: z.string().describe("Explication pourquoi et comment cette information répond à cette demande"),
    })))

    
    // @ts-ignore
    const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `
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
    new ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-4-1106-preview",
            // verbose: true
          }),
          parser
    ]);

    const relevantInfoFromText = await chain.invoke({ content: text, summaryInstruction: summaryInstruction, caseContextTest : caseContextTest, format_instructions : parser.getFormatInstructions()});

    console.log('relevantInfoFromText\n', relevantInfoFromText);
    
    const relevantInfoFromTextListArray = relevantInfoFromText.map((item : any) => {
      return item.info
    })

    const relevantInfoFromTextListString = relevantInfoFromTextListArray.join('\n -')

    const parser2 = StructuredOutputParser.fromZodSchema(z.array(
      z.object({
        info: z.string().describe("Information qui n'est pas déjà mentionnée"),
      })))

      // @ts-ignore
      const chain2 = RunnableSequence.from([
        PromptTemplate.fromTemplate(
          `
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
          new ChatOpenAI({
            maxRetries: 3,
            temperature: 0,
            modelName: "gpt-4-1106-preview",
            // verbose: true
          }),
          parser2
        ]);
        
        const onlyNewRelevantInfoFromText = await chain2.invoke({ caseContextTest: caseContextTest, infoAlreadyGathered: infoAlreadyGathered, relevantInfoFromTextListString : relevantInfoFromTextListString, format_instructions: parser2.getFormatInstructions()});
        
        
        console.log('onlyNewRelevantInfoFromText\n', onlyNewRelevantInfoFromText);
    
      const tmp = onlyNewRelevantInfoFromText.map((item : any) => {
       return item.info
      })
      const onlyNewRelevantInfoFromTextString = tmp.join('\n- ')

      return onlyNewRelevantInfoFromTextString
    } catch (error) {
      console.error(error);
        
      return ""
    }
  

}

export const getSummaryFromDoc = async (texts : string[], summaryInstruction : string, listInfoDocs : string, caseContextTest : string) : Promise<string> => {

  
    let relevantInformationList : string = `La liste est vide, sauf s'il y a des éléments après`

    for (const text of texts) {
      const listInfoTmp = listInfoDocs + relevantInformationList
      const relevantInfoToAdd = await getRelevantInfo(text, summaryInstruction, listInfoTmp, caseContextTest);
      relevantInformationList += relevantInfoToAdd;
    }

    console.log('relevantInformationList\n',relevantInformationList);
    

    return relevantInformationList
}