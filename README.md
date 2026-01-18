# Volt Playground

A fully configurable AI Agent powered by VoltAgent that runs in your terminal.

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

### Agent Configuration (`agent_config.json`)

The agent's behavior is controlled through the `agent_config.json` file in the root directory. This allows you to customize your AI agent without modifying any code.

#### Configuration Options

```json
{
  "name": "VoltAgent",
  "provider": "gemini",
  "model": "gemini-2.5-flash-lite",
  "role": "Technical Writer",
  "persona": "Helpful, empathetic"
}
```

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `name` | string | The name of your AI agent | Yes |
| `provider` | string | AI provider: `"gemini"` or `"openai"` | Yes |
| `model` | string | The specific model to use | Yes |
| `role` | string | The role of your agent | Yes |
| `persona` | string | The personality traits of your agent | Yes |


#### Example Configurations

**Technical Assistant**:
```json
{
  "name": "CodeMaster",
  "provider": "gemini",
  "model": "gemini-2.5-flash-lite",
  "role": "Technical Assistant",
  "persona": "Professional, detail-oriented, and thorough"
}
```

**Creative Writer**:
```json
{
  "name": "StoryWeaver",
  "provider": "openai",
  "model": "gpt-4o",
  "role": "Creative Writing Assistant",
  "persona": "Creative, imaginative, and inspiring"
}
```

**Research Assistant**:
```json
{
  "name": "ResearchBot",
  "provider": "gemini",
  "model": "gemini-1.5-pro",
  "role": "Research Assistant",
  "persona": "Analytical, thorough, and objective"
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

## Features

- 🔧 **Fully Configurable**: Customize agent behavior via `agent_config.json`
- 📁 **Flexible Config Path**: Specify custom config locations via CLI arguments or interactive prompts
- 🤖 **Multi-Provider Support**: Switch between Gemini and OpenAI models
- 💬 **Interactive Chat**: Terminal-based conversational interface
- ⚡ **Fast & Lightweight**: Built on VoltAgent framework

## Acknowledgments

- Built with [VoltAgent](https://voltagent.dev/) framework
- Powered by [Google Gemini AI](https://ai.google.dev/) and [OpenAI](https://openai.com/)
- Vector storage by [ChromaDB](https://www.trychroma.com/)

**Made with ⚡ by VoltAgent**
