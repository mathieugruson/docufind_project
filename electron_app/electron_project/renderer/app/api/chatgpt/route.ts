import { log } from "console";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from "langchain/vectorstores/supabase";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts"
import { StringOutputParser } from "langchain/schema/output_parser";
import { RunnableSequence, RunnablePassthrough } from "langchain/runnables";

const openAIApiKey = process.env.OPENAI_API_KEY
const SUPABASE_URL_API = process.env.SUPABASE_URL_API as string
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY as string
const openai = new OpenAI({ apiKey: `${openAIApiKey}`, dangerouslyAllowBrowser: true });

export const dynamic = 'force-dynamic'

function combineDocuments(docs : any) {
    return docs.map((doc: any) => {
        console.log('doc.pageContent : ' + doc.pageContent);
        return doc.pageContent}).join('\n\n')
}   

export async function POST(request: Request) {

    // console.log('request');
    // console.log(request);
    // const { messages } = await request.json()
    const prompt = await request.json()

    // Retrieval : Document loaders
    try {
        
        // const loader = new PDFLoader("src/app/_bigfile/dossierinstruction.pdf", {
        //     parsedItemSeparator: "",
        //   });
    
        // const docs = await loader.load();
    
        // console.log('docs');
        // console.log(docs[0].pageContent);
    } catch (error) {
        
    }
    

    // Create a vector database
    try {
    
    
    // const client = createClient(SUPABASE_URL_API, SUPABASE_API_KEY)
    
    // await SupabaseVectorStore.fromDocuments(
    //     docs,
    //     new OpenAIEmbeddings({openAIApiKey}),
    //     {
    //         client,
    //         tableName: 'documents',
    //     }
        
    //     )
        
    } catch (error) {
        console.error(error)
        return NextResponse.json(prompt)
    }
        
        
    // ask a question to chatGPT
    try { 
        
        // const response = await openai.chat.completions.create({
            //     model: "gpt-3.5-turbo",
            //     temperature: 0.2,
            //     messages: prompt
            // });
            
            // console.log('test');
            // console.log(response);
    } catch (error) {
        
    }

    // Prompt chatGPT with the prompt 
    try {

        // const llm = new ChatOpenAI({
        //     openAIApiKey,
        //     temperature: 0.5
        // })

        // const tweetTemplate = 'Generate a promotional tweet for a product, from this product description: {productDesc}'
        // const tweetPrompt = PromptTemplate.fromTemplate(tweetTemplate)
        // const tweetChain = tweetPrompt.pipe(llm)
        // const response = await tweetChain.invoke({productDesc: 'Electric shoes'})

    } catch (error) {
        
    }


    // Retrieve embedding info from database
    try {

        console.log('start');
        
        const llm = new ChatOpenAI({
            openAIApiKey,
            temperature: 0.5
        })

        const embeddings = new OpenAIEmbeddings({openAIApiKey})
        const client = createClient(SUPABASE_URL_API, SUPABASE_API_KEY)
        const vectorStore = new SupabaseVectorStore(embeddings, {
            client,
            tableName: 'documents',
            queryName: 'match_documents'
        })

        const retriever = vectorStore.asRetriever()

        const standaloneQuestionTemplate = 
        ` Selon une question donnée, tranforme la en la question qui a le plus de chance de donner de bons resutlat avec chatGPT.
        question: {question} standalone question:'`


        const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)    
        
        const answerTemplate = `Vous êtes un stagiaire qui souhaite donner la réponse la plus structurée,
        exhaustive possible de sorte que l'avocat qui vous a embauche ait confiance en votre travail.
        Il faut reformuler les informations recues sans les deformer
        context: {context}
        question: {question}
        answer: `
        
        const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
        
        const answerChain = answerPrompt
        .pipe(llm)
        .pipe(new StringOutputParser())

        const standaloneQuestionChain = standaloneQuestionPrompt.pipe(llm).pipe(new StringOutputParser)
        
        
        const retrieverChain = RunnableSequence.from([
            prevResult => prevResult.standalone_question,
            retriever,
            combineDocuments
        ])

        const mainChain = RunnableSequence.from([
            {
                standalone_question: standaloneQuestionChain,
                original_input : new RunnablePassthrough()
            },
            {
                context: retrieverChain,
                question: ({original_input}) => original_input.question
            },
            answerChain
        ])

        const response = await mainChain.invoke({
            question: `${prompt[1].content}`
        })
        
        /*
        Ecart de réponse énorme entre : 
        - Peux tu me donner un résuméde l'affaire sur cette bagarre
        - Résume moi
        */        
        
        console.log('response');
        console.log(response);

        return NextResponse.json(response)

    } catch (error) {
        console.error(error)
        return NextResponse.json(prompt)
    }

    // Exemple on Runnable Sequence
    try {
        // const llm = new ChatOpenAI({
        //     openAIApiKey,
        //     temperature: 0.5
        // })

        // const punctuationTemplate = `Given a sentence, add punctuation where needed. 
        // sentence: {sentence}
        // sentence with punctuation:  
        // `
        // const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate)
    
        // const grammarTemplate = `Given a sentence correct the grammar.
        // sentence: {punctuated_sentence}
        // sentence with correct grammar: 
        // `        
        // const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate)
        
        // const translationTemplate = `Given a sentence, translate that sentence into {language}
        // sentence: {grammatically_correct_sentence}
        // translated sentence:
        // `
        // const translationPrompt = PromptTemplate.fromTemplate(translationTemplate)

        // const punctuationChain = RunnableSequence.from([punctuationPrompt, llm, new StringOutputParser()])
        // const grammarChain = RunnableSequence.from([grammarPrompt, llm, new StringOutputParser()])
        // const translationChain = RunnableSequence.from([translationPrompt, llm, new StringOutputParser()])

        // const chain = RunnableSequence.from([
        //     {
        //         punctuated_sentence: punctuationChain,
        //         original_input: new RunnablePassthrough()
        //     },
        //     {
        //         grammatically_correct_sentence: grammarChain,
        //         language: ({ original_input }) => original_input.language
        //     },
        //     translationChain
        // ])

        // const response = await chain.invoke({
        //     sentence: 'i dont liked mondays',
        //     language: 'french'
        // })

        // console.log('response');
        // console.log(response);

    } catch (error) {
        console.error(error)
        return NextResponse.json(prompt)
    }

    return NextResponse.json(prompt) // JUST TO AVOID ERROR DURING OTHER TEST
    // return NextResponse.json(response) REAL CODE 

}


/*

TODO : 

J'en suis la
https://js.langchain.com/docs/modules/data_connection/retrievers/#get-started

- retrieve data from langchain : 
    https://www.youtube.com/watch?v=HSZ_uaif57o&ab_channel=freeCodeCamp.org 46'15
    https://www.notion.so/Quick-notes-698cc900648a497696d20962b7730e71
    https://supabase.com/dashboard/project/eacheknfquraigswjfdq/editor/28664
    https://js.langchain.com/docs/modules/data_connection/text_embedding/
- verifier les types des data envoye (https://www.npmjs.com/package/zod-form-data#zod-form-data) 


RESSOURCES :

Next OPENAI code exemple : 
https://nextjs.org/docs/app/building-your-application/routing/route-handlers

import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
 
export const runtime = 'edge'
 
export async function POST(req: Request) {
  const { messages } = await req.json()
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages,
  })
 
  const stream = OpenAIStream(response)
 
  return new StreamingTextResponse(stream)
}


Code exemple : 

import { cookies } from 'next/headers'
 
export async function GET(request: Request) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token.value}` },
  })
}


*/