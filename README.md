# Volt Playground

A fully configurable **Multi-Agent AI System** powered by VoltAgent that runs in your terminal. Chat with multiple AI agents, each with unique capabilities, personas, and expertise.

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v10.15.0 or higher (specified in package.json)
- **API Keys**: Required based on your chosen provider
  - **Gemini**: `GEMINI_API_KEY`
  - **OpenAI**: `OPENAI_API_KEY`

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd volt-playground
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # For Gemini (default)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # For OpenAI (if using OpenAI provider)
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Configuration

### Multi-Agent Configuration (`agent_config.json`)

The system supports **multiple AI agents** with different capabilities and personas. Configure all your agents in the `agent_config.json` file in the root directory. You can switch between agents during your chat session without restarting the application.

#### Configuration Structure

```json
{
  "defaultAgent": "technical-writer",
  "agents": [
    {
      "id": "technical-writer",
      "name": "VoltAgent",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Technical Writer",
      "persona": "Helpful, empathetic",
      "description": "Expert in creating clear, concise technical documentation"
    },
    {
      "id": "code-reviewer",
      "name": "CodeGuardian",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Senior Code Reviewer",
      "persona": "Detail-oriented, constructive, thorough",
      "description": "Specialized in code quality, best practices, and security reviews"
    }
  ]
}
```

#### Configuration Fields

**Root Level:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `defaultAgent` | string | The ID of the agent to use by default when starting for first time | Yes |
| `agents` | array | Array of agent configurations (must contain at least one agent) | Yes |

**Agent Configuration:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | string | Unique identifier for the agent (used for switching between agents) | Yes |
| `name` | string | Display name of the AI agent | Yes |
| `provider` | string | AI provider: `"gemini"` or `"openai"` | Yes |
| `model` | string | The specific model to use | Yes |
| `role` | string | The professional role of the agent | Yes |
| `persona` | string | Personality traits and communication style | Yes |
| `description` | string | Brief description of the agent's expertise and capabilities | Yes |


#### Example Multi-Agent Configurations

**Development Team Setup** (Code Review, Documentation, and Architecture):

```json
{
  "defaultAgent": "code-reviewer",
  "agents": [
    {
      "id": "code-reviewer",
      "name": "CodeGuardian",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Senior Code Reviewer",
      "persona": "Detail-oriented, constructive, thorough",
      "description": "Specialized in code quality, best practices, and security reviews"
    },
    {
      "id": "tech-writer",
      "name": "DocBot",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Technical Writer",
      "persona": "Clear, concise, user-focused",
      "description": "Expert in creating API docs, README files, and user guides"
    },
    {
      "id": "architect",
      "name": "SystemDesigner",
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "role": "Software Architect",
      "persona": "Strategic, analytical, forward-thinking",
      "description": "Designs scalable systems and evaluates architectural decisions"
    }
  ]
}
```

**Content Creation Team** (Writing, Editing, and Research):

```json
{
  "defaultAgent": "creative-writer",
  "agents": [
    {
      "id": "creative-writer",
      "name": "StoryWeaver",
      "provider": "openai",
      "model": "gpt-4o",
      "role": "Creative Writer",
      "persona": "Imaginative, expressive, engaging",
      "description": "Crafts compelling narratives, blog posts, and creative content"
    },
    {
      "id": "editor",
      "name": "EditPro",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Content Editor",
      "persona": "Meticulous, constructive, grammar-focused",
      "description": "Polishes content for clarity, grammar, and style"
    },
    {
      "id": "researcher",
      "name": "ResearchBot",
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "role": "Research Assistant",
      "persona": "Analytical, thorough, objective",
      "description": "Gathers information, fact-checks, and provides citations"
    }
  ]
}
```

**Learning Assistant Setup** (Tutor, Quiz Master, and Study Guide):

```json
{
  "defaultAgent": "tutor",
  "agents": [
    {
      "id": "tutor",
      "name": "TeachBot",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Personal Tutor",
      "persona": "Patient, encouraging, adaptive",
      "description": "Explains concepts clearly with examples and analogies"
    },
    {
      "id": "quiz-master",
      "name": "QuizBot",
      "provider": "gemini",
      "model": "gemini-2.5-flash-lite",
      "role": "Quiz Master",
      "persona": "Challenging, fair, motivating",
      "description": "Creates practice questions and provides detailed feedback"
    },
    {
      "id": "study-guide",
      "name": "StudyPal",
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "role": "Study Guide Creator",
      "persona": "Organized, comprehensive, structured",
      "description": "Summarizes topics and creates study materials"
    }
  ]
}
```

### Running the Application

#### Default Usage

Start the interactive chat interface with the default `agent_config.json` in the root directory:

```bash
pnpm start
# or
pnpm dev
```

#### Custom Config Path

You can specify a custom path to your `agent_config.json` file using the `--agent_config` flag:

```bash
# Using --agent_config= syntax
pnpm start --agent_config=/path/to/your/agent_config.json

# Using --agent_config with space
pnpm start --agent_config /path/to/your/agent_config.json
```

**Examples**:
```bash
# Load config from a different directory
pnpm start --agent_config=./configs/my-agent.json

# Load config from an absolute path
pnpm start --agent_config=/Users/username/Documents/agent_config.json
```

#### Interactive Config Path Prompt

If the default `agent_config.json` is not found and no `--agent_config` argument is provided, the application will prompt you to enter the path interactively:

```
⚠️  Could not load agent configuration.
Failed to load agent config from "agent_config.json": ENOENT: no such file or directory

Enter the path to your agent_config.json file: 
```

Simply type or paste the path to your configuration file and press Enter. The application will validate the config and prompt again if the path is invalid.

The agent will load your configuration and start an interactive terminal session.

#### Using Interactive Commands

Once the application is running, type `/help` to see all available commands for managing your chat sessions, viewing history, and more. See the [Interactive Commands](#interactive-commands) section below for details.

## Features

- 🤖 **Multi-Agent System**: Configure and switch between multiple AI agents with different expertise
- 🔧 **Fully Configurable**: Customize agent behavior via `agent_config.json`
- � **Dynamic Agent Switching**: Switch between agents during chat without restarting
- �📁 **Flexible Config Path**: Specify custom config locations via CLI arguments or interactive prompts
- 🎭 **Unique Personas**: Each agent has its own role, personality, and communication style
- 🧠 **Persistent Memory**: Each agent maintains its own conversation context
- 💬 **Interactive Chat**: Terminal-based conversational interface with rich commands
- 📜 **Chat History**: Persistent conversation history with ability to load and continue past chats
- 🔌 **Multi-Provider Support**: Switch between Gemini and OpenAI models
- 💾 **Local Storage**: All conversations stored locally in SQLite database
- ⚡ **Fast & Lightweight**: Built on VoltAgent framework

## Interactive Commands

Once the application is running, you can use the following commands:

| Command | Description |
|---------|-------------|
| `/help` | Display all available commands |
| `/new` | Start a new chat session |
| `/history` | List all your past conversations |
| `/load <chat_id>` | Load and continue a specific conversation |
| `/view` | View the current chat history |
| `/agents` | List all available agents with their details |
| `/switch <agent_id>` | Switch to a different agent |
| `/current` | Show information about the current active agent |
| `/bye` | Exit the application |

### Multi-Agent Commands

**List all available agents:**
```
You: /agents

🤖 Available Agents:
────────────────────────────────────────────────────────────────────────────────
● 1. VoltAgent (technical-writer)
   Role: Technical Writer
   Persona: Helpful, empathetic
   Description: Expert in creating clear, concise technical documentation
   Provider: gemini | Model: gemini-2.5-flash-lite

○ 2. CodeGuardian (code-reviewer)
   Role: Senior Code Reviewer
   Persona: Detail-oriented, constructive, thorough
   Description: Specialized in code quality, best practices, and security reviews
   Provider: gemini | Model: gemini-2.5-flash-lite

────────────────────────────────────────────────────────────────────────────────
💡 Use /switch <agent_id> to change agents
```

**Switch to a different agent:**
```
You: /switch code-reviewer

✓ Switched to agent: CodeGuardian
Role: Senior Code Reviewer
Persona: Detail-oriented, constructive, thorough
Description: Specialized in code quality, best practices, and security reviews
```

**View current agent:**
```
You: /current

🤖 Current Agent:
────────────────────────────────────────────────────────────
  Name: CodeGuardian
  ID: code-reviewer
  Role: Senior Code Reviewer
  Persona: Detail-oriented, constructive, thorough
  Description: Specialized in code quality, best practices, and security reviews
  Provider: gemini
  Model: gemini-2.5-flash-lite
────────────────────────────────────────────────────────────
```

### Chat History Usage

**View your past conversations:**
```
You: /history

💬 Your Chat History:
────────────────────────────────────────────────────────────────────────────────
1. How do I implement authentication in Node.js? (12 messages)
   ID: chat_abc123...
   Last updated: 1/18/2026, 2:30:45 PM

2. Explain React hooks (8 messages)
   ID: chat_def456...
   Last updated: 1/17/2026, 4:15:22 PM
────────────────────────────────────────────────────────────────────────────────
💡 Use /load <chat_id> to continue a conversation
```

**Load a previous conversation:**
```
You: /load chat_abc123...

✓ Loaded chat: How do I implement authentication in Node.js?
Messages: 12

📜 Chat History:
────────────────────────────────────────────────────────────────────────────────
[2:25:30 PM] You: How do I implement authentication in Node.js?
[2:25:35 PM] Agent: I'll help you implement authentication...
...
────────────────────────────────────────────────────────────────────────────────
```

**Start a new conversation:**
```
You: /new

✨ Started new chat session: chat_xyz789...
```

## Data Storage

All chat data is stored locally in `.voltagent/memory.db` using LibSQL (SQLite):

- **Conversations**: Stored in `voltagent_memory_conversations` table
  - Includes conversation ID, title, timestamps, and metadata
- **Messages**: Stored in `voltagent_memory_messages` table
  - Includes message content, role (user/assistant), and timestamps
- **Automatic Persistence**: All messages are automatically saved as you chat
- **Privacy**: Everything is stored locally on your machine

## Acknowledgments

- Built with [VoltAgent](https://voltagent.dev/) framework
- Powered by [Google Gemini AI](https://ai.google.dev/) and [OpenAI](https://openai.com/)
- Vector storage by [ChromaDB](https://www.trychroma.com/)

**Made with ⚡ by VoltAgent**
