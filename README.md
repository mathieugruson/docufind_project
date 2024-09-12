# Docufind 📚⚖️

### Overview 🌟

**Docufind** was developed to tackle a significant challenge faced by lawyers: managing and reading thousands of pages of documents in large legal cases. The project evolved across three different repositories as we explored various solutions and gathered insights.

This tool aims to balance two key requirements:
1. **Security** 🔒 – Ensuring that sensitive legal documents are well-protected.
2. **User Experience** 💡 – Providing an intuitive interface that boosts a lawyer's efficiency.

### The Initial Approach 🚀

Initially, **Docufind** was conceived as an Electron app. This choice was driven by the desire to minimize security risks by not storing any lawyer's files on external servers. Our aim was for the documents' contents to be processed directly by the OpenAI API, remaining on the lawyer's device.

However, this approach faced practical challenges:
- Difficulty in using an API key securely while maintaining a seamless user experience.
- The direct use of the API introduced complexities due to API token limitations.

Though this initial strategy was less than ideal, much of the Electron app was developed and is shared here to benefit others.

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
  - Secure file storage with encryption techniques
  - Creating a ChatGPT-like chat zone
  - Designing a nested folder structure with adaptable UI components

### Screenshots 📸

Below are some images that illustrate various parts of the project:

<!-- Add screenshots here -->

### Repository Structure 📁

1. **Repo 1** - Initial Electron App Development
   - Focus on local file security and direct OpenAI API access.
   
2. **Repo 2** - Transition to Web App
   - Enhancements in usability and security for web-based access.

3. **Repo 3** - Final Iteration
   - A fully functional web application featuring advanced document management tools.

### Conclusion 🎉

Docufind has been a challenging yet rewarding journey, offering deep insights into the integration of technology in legal practices. I’m excited to share this code for others to learn from and perhaps contribute to its future development. Let's make the law a bit more colorful and engaging together!

