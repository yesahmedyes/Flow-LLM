# FlowLLM

A modern AI chat application built with Next.js, featuring multiple LLM models, memory management, file handling, and rich chat interactions.

## Features

- 💬 **Multi-model Support**: Integration with OpenAI, OpenRouter, and Cohere models
- 🧠 **Memory System**: Knowledge graph visualization and management through Zep Memory
- 📁 **File Management**: Upload, store, and process different file types through AWS S3
- 🔎 **Vector Search**: Document retrieval using Pinecone for embeddings
- 🌐 **Web Search**: Integration with search capabilities for up-to-date information
- 🔒 **User Authentication**: Secure login using Clerk
- 📱 **Responsive Design**: Modern UI built with Radix UI and Tailwind
- 🔄 **Real-time Streaming**: Stream AI responses in real-time
- 📊 **Persistent Storage**: Chat history and files stored in Turso DB (SQLite)
- 🔄 **State Management**: Zustand for efficient state management

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**:
  - [Radix UI](https://www.radix-ui.com/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**:
  - [AI SDK](https://ai.vercel.ai/)
  - [OpenAI SDK](https://platform.openai.com/)
  - [OpenRouter AI](https://openrouter.ai/)
  - [Cohere](https://cohere.com/)
- **Memory & Vector Search**:
  - [Zep Memory](https://www.getzep.com/)
  - [Pinecone](https://www.pinecone.io/)
- **Database**:
  - [Turso DB](https://turso.tech/) (SQLite)
  - [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**:
  - [AWS S3](https://aws.amazon.com/s3/)
  - [Upstash Redis](https://upstash.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Visualization**: [D3.js](https://d3js.org/) for graph visualization

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v9.0.6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/flowllm.git
   cd flowllm
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following variables:

   ```
   # Database
   DATABASE_URL=your_turso_database_url
   DATABASE_AUTH_TOKEN=your_turso_auth_token

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # AI Services
   OPENROUTER_API_KEY=your_openrouter_api_key
   COHERE_API_KEY=your_cohere_api_key

   # Vector Database
   PINECONE_API_KEY=your_pinecone_api_key

   # Memory
   ZEP_API_KEY=your_zep_api_key

   # Storage
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

   # File Storage (AWS S3)
   AWS_REST_REGION=your_aws_region
   AWS_REST_ACCESS_KEY=your_aws_access_key
   AWS_REST_SECRET_KEY=your_aws_secret_key
   ```

4. Run database migrations:

   ```bash
   pnpm db:migrate
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Commands

- `pnpm dev` - Start the development server with Turbo
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format:write` - Format code with Prettier
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio to manage your database
- `pnpm typecheck` - Run TypeScript type checking

## Project Structure

- `/src/app` - Next.js App Router pages and components
- `/src/server` - Server-side logic and API endpoints
- `/src/server/db` - Database schema and connections
- `/src/lib` - Utilities and shared types
- `/src/hooks` - Custom React hooks
- `/src/trpc` - tRPC API router setup
- `/migrations` - Database migration files
