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
  "description": "A fully configurable AI Agent in your terminal powered by VoltAgent",
  "persona": "Helpful, empathetic"
}
```

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `name` | string | The name of your AI agent | Yes |
| `provider` | string | AI provider: `"gemini"` or `"openai"` | Yes |
| `model` | string | The specific model to use | Yes |
| `description` | string | A brief description of your agent's purpose | Yes |
| `persona` | string | The personality traits of your agent | Yes |


#### Example Configurations

**Technical Assistant**:
```json
{
  "name": "CodeMaster",
  "provider": "gemini",
  "model": "gemini-2.5-flash-lite",
  "description": "A technical assistant specialized in code review and debugging",
  "persona": "Professional, detail-oriented, and thorough"
}
```

**Creative Writer**:
```json
{
  "name": "StoryWeaver",
  "provider": "openai",
  "model": "gpt-4o",
  "description": "A creative writing assistant for storytelling and content creation",
  "persona": "Creative, imaginative, and inspiring"
}
```

**Research Assistant**:
```json
{
  "name": "ResearchBot",
  "provider": "gemini",
  "model": "gemini-1.5-pro",
  "description": "An AI assistant for research and analysis",
  "persona": "Analytical, thorough, and objective"
}
```

### Running the Application

Start the interactive chat interface:

```bash
pnpm start
# or
pnpm dev
```

The agent will load your configuration from `agent_config.json` and start an interactive terminal session.

## Features

- 🔧 **Fully Configurable**: Customize agent behavior via `agent_config.json`
- 🤖 **Multi-Provider Support**: Switch between Gemini and OpenAI models
- 💬 **Interactive Chat**: Terminal-based conversational interface
- ⚡ **Fast & Lightweight**: Built on VoltAgent framework

## Acknowledgments

- Built with [VoltAgent](https://voltagent.dev/) framework
- Powered by [Google Gemini AI](https://ai.google.dev/) and [OpenAI](https://openai.com/)
- Vector storage by [ChromaDB](https://www.trychroma.com/)

**Made with ⚡ by VoltAgent**
