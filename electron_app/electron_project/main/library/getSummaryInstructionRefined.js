"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryInstructionRefined = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const getSummaryInstructionRefined = async (userSummaryInstruction) => {
    const chain1 = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(`{userInstruction}\n\n
            ###
            L'utilisateur souhaite extraire les données associées dans un texte concernant l'instruction de l'utilisateur ci-dessus (###).
            Peux-tu faire une liste de sous taches pour rendre la reponse plus pertinente ?\n
            Format de reponse attendu : liste non hierarchique
            Exemple : 
            Pour cette instruction d'un utilisateur :\n  
            - identités des accusés et éléments démontrant leur culpabilité pour chacun d'entre eux\n
            - éléments pouvant potentiellement innoncenter les accusés ou mettre à mal l'accusation\n
            Une bonne réponse serait : 
            - Identifier les noms des accusés impliqués dans l'affaire.
            - Extraire les éléments de preuve ou de témoignages qui démontrent leur culpabilité.
            - Identifier les éléments pouvant potentiellement innocenter les accusés ou mettre à mal l'accusation.
            - Repérer les éléments de preuve ou de témoignages qui pourraient disculper les accusés.
            - Identifier les points faibles de l'accusation qui pourraient être utilisés par la défense.
            
            Reponds sous forme de liste sans aucune autre mot ou structure et soit très imaginatif : 
            - x
            - y
            - z
            `),
        new openai_1.ChatOpenAI({
            maxRetries: 3,
            temperature: 1,
            modelName: "gpt-4-1106-preview",
            // verbose: true
        }),
        new output_parsers_1.StringOutputParser(),
    ]);
    const result1 = await chain1.invoke({ userInstruction: userSummaryInstruction });
    console.log('result1\n', result1);
    const chain2 = runnables_1.RunnableSequence.from([
        prompts_1.PromptTemplate.fromTemplate(`
                ***
                {subtaskList}
                ***
                Ci dessus, entre ***, se trouve une liste de sous-tâches a ete faites a partir d'instructions données par un utilisateur.
                Il faut maintenant décomposer ces sous-tâches en une liste de d'instruction pour aider l'intelligence artificielle a trouver
                les bonnes réponses
                1. en rendant les instructions plus claires et précises
                2. en spécifiant les types de données à rechercher (comme les indices, témoignages, alibis)
                3. en demander un niveau de précision minitieux 
                

                Voici un exemple à suivre entre (&&&) :
                &&& 
                En se basant sur une liste de sous tâches suivantes :
                - Identifier les noms des accusés impliqués dans l'affaire.
                - Extraire les éléments de preuve ou de témoignages qui démontrent leur culpabilité.
                - Identifier les éléments pouvant potentiellement innocenter les accusés ou mettre à mal l'accusation.
                - Repérer les éléments de preuve ou de témoignages qui pourraient disculper les accusés.
                - Identifier les points faibles de l'accusation qui pourraient être utilisés par la défense.
                Voici a quoi pourrait ressembler de telles exemples d'instructions dans ce cas :
                - Recherchez dans le texte les noms des personnes accusées. 
                - Quelles sont les preuves directes impliquant [nom de l'accusé] ?
                - Y a-t-il des témoignages ou des preuves qui contredisent les charges contre [nom de l'accusé] ?
                - Examinez le texte à la recherche d'indices ou de témoignages qui impliquent chaque accusé dans l'infraction.
                - Recherchez des éléments dans le texte qui suggèrent que les accusés pourraient être innocents, comme des alibis ou des témoignages en leur faveur.
                - Cherchez des faiblesses dans l'accusation, telles que des preuves contradictoires ou des erreurs dans le processus d'enquête
                - Repérer des mots-clés ou phrases indiquant la culpabilité, tels que "preuve", "témoignage accablant", "reconnu coupable".
                - Rechercher des phrases ou des segments de texte contenant des mots-clés comme "innocent", "alibi", "faux témoignage".
                &&&

                Reponds sous forme de liste sans aucune autre mot ou structure et soit très imaginatif : 
                - x
                - y
                - z
                `),
        new openai_1.ChatOpenAI({
            maxRetries: 3,
            temperature: 1,
            modelName: "gpt-4-1106-preview",
            // verbose: true
        }),
        new output_parsers_1.StringOutputParser(),
    ]);
    const result2 = await chain2.invoke({ userInstruction: userSummaryInstruction, subtaskList: result1 });
    console.log('result2\n', result2);
    return result2;
};
exports.getSummaryInstructionRefined = getSummaryInstructionRefined;
