# Volt Playground

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v10.15.0 or higher (specified in package.json)
- **Google AI API Key**: Required for Gemini model access

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
   GEMINI_API_KEY=your_GEMINI_API_KEY_here
   ```

### Running the Application

Start the interactive chat interface:

```bash
pnpm start
# or
pnpm dev
```

## Acknowledgments

- Built with [VoltAgent](https://voltagent.dev/) framework
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Vector storage by [ChromaDB](https://www.trychroma.com/)

**Made with ⚡ by VoltAgent**
