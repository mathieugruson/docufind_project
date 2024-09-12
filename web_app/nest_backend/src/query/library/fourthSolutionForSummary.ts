
import { readdir } from 'node:fs/promises';
import { Dirent } from 'node:fs';
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { loadJsonData } from 'src/folder-creation/library/loadJsonData';
import { splitArrayIntoParts } from './utils/splitArrayIntoParts';
import { splitStringIntoArray } from './utils/splitStringIntoArray';
import { calculateMaxTokens } from '@langchain/core/language_models/base';

// 1. This function aim to extract all valuable informations from the whole text
const extractRelevantInformations = async (texts : string[], summaryExpectations : string) : Promise<string> => {
    
        const length = texts.length
        const pageByChunk = 15
        const parts = length / pageByChunk
    
        const textSplitted = splitArrayIntoParts(texts, parts)
    
    
        let allRelevantInformations : string = ''
    
        for (const [index, textArray] of textSplitted.entries()) {
    
            const arrayJoinIntoString = textArray.join("\n");
    
            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(
                    `Voici le contenu de l'ensemble d'un dossier juridique dans lequel je travaille encerclées par des (&&&) :
                    &&&
                    {texts}\n\n
                    &&&
        
                    Cherche dans le contenu entre (&&&) les informations entre (***)
                    ***
                    {summaryExpectations}\n
                    ***
        
                    Dresse la liste d'information la plus complete et exhaustive possible pour répondre aux attentes de l'utilisateur, il faut
                    être factuel et précis et n'ignorer aucune information. Donne le plus d'informations possibles. Tu peux expliquer pourquoi les éléments te semblent être des informations pertinentes
                    en relation avec l'énoncé.
                    
                    Il faut toujours justifier l'origine de tes informations pour qu'on puisse vérifier. Au dessus de chaque partie de texte est indiqué l'origine du texte :
                    x/x/x/x/.pdf page [X]. Tu peux ainsi écrire comme cela : 
                    Information X ([chemin du fichier] page [X]).            
                    `),
                    new ChatOpenAI({
                        maxRetries: 3,
                        temperature: 0,
                        modelName: "gpt-4-1106-preview",
                        // verbose: true
                   }),
                new StringOutputParser(),
            ]);
            
            const info = await chain.invoke({ texts : arrayJoinIntoString, summaryExpectations: summaryExpectations});
            allRelevantInformations = allRelevantInformations + '\n' + info
    }

    return allRelevantInformations
}

/**
 * Etape 2 : A partir de toutes les informations extraites, il faut créer un plan pour
 * que chaque partie du plan puisse ensuite être remplie avec les informations pertinentes
 * 
 * Contraintes : 
 * - Prévoir si toutes les informations font plus 15 pages, dans ce cas il faudra faire de la récursivité pour
 * être sur d'avoir un bon plan que l'on puisse découper ensuite
 * - si le plan fait plus de 4096 token, alors lui faire dire de continuer et prévoir un systeme qui le permet 
 */

/** ABANDONNÉ
 * Etape 2
 * Lui faire faire un résumé et lui dire de continuer s'il a des choses à ajouter ? Je pense que ça serait trop long ? 
 */

/**
 * "Si vous voyez des informations qui ne peuvent pas rentrer dans le plan actuel, alors modifier le plan en conséquence"
 */

const getSummaryPlan = async (allRelevantInformations : string, summaryExpectations : string) : Promise<string> => {


    // First constraint
    const contextWindow : number = 120000
    let allRelevantInformationsArray = []

    const token = await calculateMaxTokens({prompt : allRelevantInformations,  modelName: "gpt-4-1106-preview"}) // https://github.com/langchain-ai/langchainjs/issues/3294

    if (token > contextWindow) {
        allRelevantInformationsArray = splitStringIntoArray(allRelevantInformations, Math.ceil(contextWindow / token))
    } else {
        allRelevantInformationsArray.push(allRelevantInformations)
    }

    let summaryPlan = ""

    allRelevantInformationsArray.forEach(async (item, index) => {

        let planPrompt = `A partir de ces informations et de la demande de l'utilisateur, il me faut un plan dans
        lequel je pourrais ensuite insérer chacun des éléments.
        Attention, il faut renvoyer seulement le plan et aucune autre phrase : pas de phrase d'introduction, ni
        de conclusion, seulement le plan sans aucune explication ou annotation`

        let relevantInfoPrompt = ""

        if (index == 0) {
            relevantInfoPrompt = `Les informations pertinentes qui ont prélevées sont :\n${item}`
        } else {
            relevantInfoPrompt = `Les premières informations pertinentes qui ont prélevées ont permis de faire un premier plan, voici
            la suite de ces informations : \n${item}`
        }

        const prompt = `
        Un utilisateur m'as demandé de prélevé les informations pertinentes dans des documents pour répondre
        à la demande de synthèse suivante : 
        ${summaryExpectations}
    
        ${relevantInfoPrompt}

        ${planPrompt}

        Si tu n'as pas assez de token de retour pour formuler ton plan, écrit "NOT FINISH" a la fin 
        `

        const chain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                `{prompt}`),
                new ChatOpenAI({
                    maxRetries: 3,
                    temperature: 0,
                    modelName: "gpt-4-1106-preview",
                    // verbose: true
               }),
            new StringOutputParser(),
        ]);

        
        summaryPlan = await chain.invoke({prompt});
        let newPlantoken = await calculateMaxTokens({prompt : summaryPlan,  modelName: "gpt-4-1106-preview"})

        // second constraint : if LLM did not finish (mais ca arrivera peu je pense)
        while (newPlantoken > 4050) {

            const promptForFinishing = `
            Voici l'ancien prompt entre *** : 
            ***
            ${prompt}
            ***

            Voici ta réponse entre &&& : 
            &&&
            ${summaryPlan}
            &&&

            Tu peux me retourner la suite du plan et m'indiquer par un "NOT FINISH" à
            la fin si tu souhaites encore la prolongé`

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(
                    `{promptForFinishing}`),
                    new ChatOpenAI({
                        maxRetries: 3,
                        temperature: 0,
                        modelName: "gpt-4-1106-preview",
                        // verbose: true
                   }),
                new StringOutputParser(),
            ]);
    
            const planCompleted = await chain.invoke({promptForFinishing});
            summaryPlan = summaryPlan + planCompleted
            newPlantoken = await calculateMaxTokens({prompt : planCompleted,  modelName: "gpt-4-1106-preview"})
            
        }

        planPrompt = `Voici le plan déja obtenue :\n${summaryPlan}\n
        Tu peux le changer, le compléter ou le préciser en fonction des nouvelles informations que
        tu as eu.
        Attention, il faut renvoyer seulement le plan et aucune autre phrase : pas de phrase d'introduction, ni
        de conclusion, seulement le plan sans aucune explication ou annotation`
        
    })

    return summaryPlan

}


/**
 * Etape 3
 * Param : on reçoit 1. le plan qui a éte établi,  ainsi que toutes les informations pertinentes
 * Logic : il faut soumettre les informations pertinentes et dire de donner le titre du plan et les informations pertinentes qui vont dedans
 * pour ne passer qu'une fois chaque chunck
 * Constraint : 
 * - il faut faire attention a ce que la LLM ne sorte pas plus de 4096 token ou sinon lui dire de continuer 
 * - il ne faut pas que les informations se répètent : lui dire voici ce qui est déjà présent ou faire reformuler à la fin ? 
 * Return : le plan et les informations allant dedans 
 *  
 */

const fillPlanWithInformations = async (allRelevantInformations : string, summaryPlan : string, summaryExpectations : string) => {

    const summaryPlanSplitted =  summaryPlan.split('\n')
    let planWithInfo = summaryPlanSplitted.map(part => {
        return {
            title: part,
            information: []
        };
    });


    const charactersPerPage = 1800 
    const pageMax = 15
    const maxChar = charactersPerPage * pageMax
    const allRelevantInformationsLength = allRelevantInformations.length
    let allRelevantInformationsArray = []

    if (allRelevantInformationsLength > maxChar) {
        allRelevantInformationsArray = splitStringIntoArray(allRelevantInformations, Math.ceil(allRelevantInformationsLength / maxChar))
    } else {
        allRelevantInformationsArray.push(allRelevantInformations)
    }

    // https://www.npmjs.com/package/fastest-levenshtein
    // https://github.com/ka-weihe/fastest-levenshtein
    // see chatGPT
    /**
     * we are going to ask the LLM to return an object with the name of the part in first and the informations inside in second
     * then we we will compare basend and levenshtein approach to avoid slight error from the LLM and put the information inside the object
     * 
     */

    let planWithInformations = ''


    allRelevantInformationsArray.forEach(async (item, index) => {

        let relevantInfoPrompt = `Les informations pertinentes qui ont prélevées sont :\n${item}`

        const prompt = `
        Un utilisateur m'as demandé de prélevé les informations pertinentes dans des documents pour répondre
        à la demande de synthèse suivante : 
        ${summaryExpectations}
        
        ${relevantInfoPrompt}

        Il faut que tu répartisses ces informations dans les différentes parties du plan ci-dessous : 
        ${summaryPlan}
        
        Le format de la réponse devra être un objet comme cela :

        [{
            title: title_name,
            information: relevant_informations
        },
        {
            title: title_name,
            information: relevant_informations
        },
        {
            title: title_name,
            information: relevant_informations
        }]`



        const chain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                `{prompt}`),
                new ChatOpenAI({
                    maxRetries: 3,
                    temperature: 0,
                    modelName: "gpt-4-1106-preview",
                    // verbose: true
               }),
            new StringOutputParser(),
        ]);

        
        planWithInformations = await chain.invoke({prompt});
        let planWithInformationstoken = await calculateMaxTokens({prompt : planWithInformations,  modelName: "gpt-4-1106-preview"})

        // second constraint : if LLM did not finish (mais ca arrivera peu je pense)
        while (planWithInformationstoken > 4050) {

            const promptForFinishing = `
            Voici l'ancien prompt entre *** : 
            ***
            ${prompt}
            ***

            Voici ta réponse entre &&& : 
            &&&
            ${planWithInformations}
            &&&

            Tu peux me retourner la suite du plan et m'indiquer par un "NOT FINISH" à
            la fin si tu souhaites encore la prolongé`

            const chain = RunnableSequence.from([
                PromptTemplate.fromTemplate(
                    `{promptForFinishing}`),
                    new ChatOpenAI({
                        maxRetries: 3,
                        temperature: 0,
                        modelName: "gpt-4-1106-preview",
                        // verbose: true
                   }),
                new StringOutputParser(),
            ]);
    
            const answerCompleted = await chain.invoke({promptForFinishing});
            planWithInformations = planWithInformations + answerCompleted
            planWithInformationstoken = await calculateMaxTokens({prompt : answerCompleted,  modelName: "gpt-4-1106-preview"})
            
        }

        // TODO ICI IL FAUT IMPLEMENTER LA LOGIQUE POUR CONVERTIR LE LLM DANS UNE ARRAY ET DONNER LES INFOS A NOTRE OBJET 
        
    })


    
    // Example function to add information to a part of the plan
    function addInformation(partTitle, info) {
        // Find the part of the plan by title
        const part = planWithInfo.find(part => part.title === partTitle);
        if (part) {
            // Add the information to this part
            part.information.push(info);
        } else {
            console.log("Part not found.");
        }
    }
    
    // Example usage:
    addInformation('Part One: Introduction', 'This is an introduction to the project.');
    addInformation('Part Three: Methodology', 'We used a qualitative analysis.');

}

/**
 * Etape 4
 * 
 * Donner les informations dans chaque partie et lui dire d'éliminer les informations en doubles et de reformuler pour faire au propre 
 * Contraintes : 
 * - si plus de 15 pages, il faut split et refaire
 * - si plus de 4096 token en sortie il faut lui faire compléter
 */

/**
 * Etape 5
 * Lui donner toutes la synthèse et lui faire reformuler chaque partie si nécessaire pour que ce soit bien cohérent ? 
 */