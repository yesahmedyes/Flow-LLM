# FlowLLM

A modern AI chat application built with Next.js, featuring multiple LLM models, file uploads, and rich chat interactions.

## Features

- 💬 **Multi-model Chat Interface**: Interact with various AI models
- 📁 **File Management**: Upload and process different file types including PDFs
- 🔒 **User Authentication**: Secure login using Clerk
- 📱 **Responsive Design**: Modern UI that works across devices
- 🔄 **Real-time Streaming**: Stream AI responses in real-time
- 📊 **Persistent Storage**: Chat history and files stored in Turso (SQLite)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**:
  - [Radix UI](https://www.radix-ui.com/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration**:
  - OpenAI SDK
  - AI SDK React
  - OpenRouter AI
- **Database**:
  - [Turso DB](https://turso.tech/) (SQLite)
  - [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Clerk](https://clerk.com/)
- **File Handling**: [UploadThing](https://uploadthing.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
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
   DATABASE_URL=your_turso_database_url
   DATABASE_AUTH_TOKEN=your_turso_auth_token

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id

   OPENAI_API_KEY=your_openai_api_key
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

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format:write` - Format code with Prettier
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio

## Roadmap

- Memories integration with Mem.ai
- Agentic mode with web search and RAG
- LaTeX equation support in markdown
- File and image attachment uploads in chat
- Custom workflows using LangFlow or FlowiseAI

## License

[MIT](LICENSE)
