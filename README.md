# Docufind 📚⚖️

### Overview 🌟

**Docufind** was developed to tackle a significant challenge faced by lawyers: managing and reading thousands of pages of documents in large legal cases. The project evolved across three different repositories as we explored various solutions and gathered insights. As, for now, openAI models lack of precision, the goal was to provide a cross-checking for a work that is often made by interns. 

**My observation was that even though LLMs are good and go beyond keyword search, semantic proximity is necessary. Many solutions suggested searching within documents by semantic proximity. I noticed that it didn't work well for questions like: can you summarize this file, what are the incriminating and exculpatory elements, which are theoretical concepts. To answer these questions, a large context window wasn't enough either, as it lacked precision. As you can see in the code, it was necessary to go through all the pages to extract the relevant information. The result was positive, but the cost was too high.**

### 

Our tries aimed to balance two key requirements:
1. **Security** 🔒 – Ensuring that sensitive legal documents are well-protected.
2. **User Experience** 💡 – Providing an intuitive interface that boosts a lawyer's efficiency.

### The Initial Approach 🚀

Initially, **Docufind** was conceived as an Electron app. This choice was driven by the desire to minimize security risks by not storing any lawyer's files on external servers. Our aim was for the documents' contents to be processed directly by the OpenAI API, remaining on the lawyer's device.

However, this approach faced practical challenges:
- Difficulty in using an API key securely while maintaining a seamless user experience.
- The direct use of the API introduced complexities due to API token limitations (https://platform.openai.com/docs/guides/rate-limits/usage-tiers?context=tier-one). In short, you can't use as much token as you want as a new user so you would have been block to try the app on large files.

Though this initial strategy was less than ideal, much of the Electron app was developed and is shared here to benefit others.

### The second approach 🌐

We decider to pivot to a webapp where everything was encrypted (files, VectorDB) following a no log policy. Everything worked fine. 
Nevertheless, we were stuck by pricing. Either, the model was affordable but not enough good, or the model was to expensive and good enough for the job (https://openai.com/api/pricing/)
as the API cost was around 10 EUR for 500 pages. 

### What I Learned 🎓

The journey with Docufind enriched my experience immensely in both AI technologies and web development:

- **Artificial Intelligence** 🤖
  - Vector databases
  - Embeddings
  - OpenAI API integration
  - LangChain for crafting language models

- **Web Development** 🌐
  - Backend: Nest.js
  - Frontend: Next.js, TypeScript, Tailwind CSS, HTML
  - Architectural design: NGINX, Docker
  
- **Project-Specific Skills** 🛠️
  - Displaying PDFs clearly and interactively
  - Encrypting and decrypting data securely
  - OCR to extract text from documents
  - manage different docs format (docx, pdf, pptx, png, jpg, etc.)
  - Secure file storage with encryption techniques
  - Creating a ChatGPT-like chat zone
  - Designing a nested folder structure with adaptable UI components

- **Soft Skills** 👷
  - organisation
  - communication

### Screenshots 📸

Below are some images that illustrate the project, where you were able to click on the doc link to verify the given information, which display the docs at the given page.
You could then go through the doc if you will:

<img src="https://github.com/user-attachments/assets/769f1501-6b26-41e8-9e69-671fbfe492f9" alt="docufind" height="500" width="1000"/>
<img src="https://github.com/user-attachments/assets/ba65ecec-9e63-4ed3-b5df-ea0723978851" alt="docufind" height="500" width="1000"/>

You could also select the folder or the file and see the files loading :  

![image](https://github.com/user-attachments/assets/023a73dc-bced-452c-8091-493c76a127e4)


### Repository Structure 📁

1. **Repo 1** - Initial Electron App Development
   - Focus on local file security and direct OpenAI API access.
   
2. **Repo 2** - Try with OCR

3. **Repo 3** - Final Iteration
   - A fully functional web application featuring advanced document management tools.

### Last update
05/2024. It is possible that some troubles appears as node module evolve and can become deprecated.



