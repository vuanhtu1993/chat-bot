# Chatbot Frontend

A modern chatbot interface built with Next.js, TypeScript, and Tailwind CSS. This application features integration with OpenAI's GPT models and multiple search engines.

## Features

- Modern chat interface with real-time responses
- Voice input/output support
- Multiple search engine integration (Google and Bing)
- Configurable settings for AI model parameters
- Responsive design with Tailwind CSS
- Persistent chat history with MongoDB
- MongoDB connection check at startup

## Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your API keys:

   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
   NEXT_PUBLIC_GOOGLE_CX=your_google_cx
   NEXT_PUBLIC_BING_API_KEY=your_bing_api_key
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

   Note: The server will check the MongoDB connection at startup and log the result to the terminal.

## Project Structure

- `/src/components` - React components
  - `ChatInterface.tsx` - Main chat interface
  - `SettingsComponent.tsx` - Settings panel
- `/src/lib` - Utility functions and services
  - `openai.ts` - OpenAI API integration
  - `search.ts` - Search engines integration
  - `/db` - Database utilities
    - `mongodb.ts` - MongoDB client setup
    - `chatHistory.ts` - Chat history services
    - `initMongoDB.ts` - MongoDB initialization and connection verification
- `/scripts` - Utility scripts
  - `checkMongoDB.js` - MongoDB connection check script

## Technologies Used

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- OpenAI API
- Google Custom Search API
- Bing Web Search API
- HeadlessUI for UI components
- React Hot Toast for notifications
- MongoDB for chat history persistence
