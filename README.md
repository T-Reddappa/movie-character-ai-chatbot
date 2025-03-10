# Character Chatbot

A scalable backend application for an AI-powered movie character chatbot. This project leverages Node.js, Express, WebSockets, and BullMQ with Redis for background task processing.

## Features
- **Authentication & Authorization:** Users must sign up or sign in to receive a JWT token. JWT token is required to authenticate and connect to WebSocket.
   -  - **Authorization Header Format:**  
    ```ws
    authorization: Bearer <token>
    ```

- **Real-time Communication:** Uses WebSocketServer for real-time chat interactions.
- **Rate Limiting:** Protects against abuse by limiting API calls (5 requests/second per user).
- **Background Processing:** Utilizes BullMQ with Redis to handle asynchronous tasks (e.g., AI response generation, query embedding).
- **Caching:** Implements caching to retrive character dialogue retrievals fast.
- **Database Integration:** Connects to MongoDB for user management (to store user credentials and to store user chats).

## Prerequisites

- **Node.js:** v14 or later
- **npm:** Comes with Node.js
- **Redis:** A local or remote Redis server is required by BullMQ.
- **MongoDB:** Ensure you have access to a MongoDB instance for the user database.

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/T-Reddappa/character-chatbot.git
   cd character-chatbot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   
   Create a `.env` file in the root with the following keys (update with your values):
   ```env
   PORT=3000
   OPENAI_API_KEY = your OpenAI API key
   PINECONE_API_KEY = your Pinecone API key to store vector embeddings data
   UPSTASH_REDIS_URL= redis://<username>:<password>@<host>:<port> (get from upstash)
   MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/database
   JWT_SECRET=your_jwt_secret
   
   ```
   > **Tip:** For local testing, you can run Redis and MongoDB instances locally or use Docker.

## Running the Application

### Development

To start the development server with live-reloading via ts-node:

```bash
npm run dev
```

This starts the Express server on the port specified in your `.env` file and opens the WebSocket server on same port.

### Production

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

## BullMQ Workers and Queue Processing

This application uses BullMQ for asynchronous task processing. The queues are defined in `src/services/queue.ts` and are responsible for:
- **AI Response Generation:** Processing incoming chat messages and generating responses.
- **Embedding Generation:** Creating embeddings for queries.

The workers are automatically started when the app starts. Ensure your Redis server (as configured in `UPSTASH_REDIS_URL`) is running.

## Troubleshooting

- **MaxListenersExceededWarning:**  
  If you see a warning related to the maximum number of listeners, increase the limit by adding the following at the top of your entry file (`src/index.ts`):
  ```typescript
  import { EventEmitter } from "events";
  EventEmitter.defaultMaxListeners = 20;
  ```
- **Redis Connection Issues:**  
  Verify that the `UPSTASH_REDIS_URL` in your `.env` file is correct and that your Redis instance is running and accessible.

## License

This project is licensed under the MIT License.
